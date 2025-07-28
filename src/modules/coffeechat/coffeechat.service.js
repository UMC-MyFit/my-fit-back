import { PrismaClient } from '@prisma/client'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import redisClient from '../../libs/redisClient.js'
import { io } from '../../socket/socket.js'
const prisma = new PrismaClient()
const coffeechatService = {
    getCoffeeChatPreview: async (chattingRoomId) => {
        // 1. 채팅방의 참여자 2명 가져오기
        const chats = await prisma.chat.findMany({
            where: { chat_id: chattingRoomId },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true,
                    }
                }
            }
        })

        if (chats.length !== 2) {
            throw new BadRequestError('존재하지 않는 채팅방입니다.')
        }

        // 2. 참여자 정보 분리
        const [serviceA, serviceB] = chats.map((chat) => chat.service)

        return convertBigIntsToNumbers({
            participants: [
                {
                    service_id: serviceA.id,
                    name: serviceA.name,
                    profile_img: serviceA.profile_img,
                },
                {
                    service_id: serviceB.id,
                    name: serviceB.name,
                    profile_img: serviceB.profile_img
                }
            ]
        })
    },
    requestCoffeechat: async ({ chattingRoomId, senderId, receiver_id, title, scheduled_at, place }) => {
        const tx = await prisma.$transaction(async tx => {
            console.log(chattingRoomId, senderId, receiver_id, title, scheduled_at, place)
            // 1. 커피챗 생성
            const newCoffeeChat = await tx.coffeeChat.create({
                data: {
                    requester_id: BigInt(senderId),
                    receiver_id: BigInt(receiver_id),
                    title,
                    scheduled_at: new Date(scheduled_at),
                    place
                }
            })

            // 2. 메시지 생성및 Redis 캐시 (type: COFFEECHAT)
            const newMessage = await tx.message.create({
                data: {
                    chat_id: BigInt(chattingRoomId),
                    sender_id: BigInt(senderId),
                    detail_message: '커피챗 요청이 도착했습니다.',
                    type: 'COFFEECHAT'
                }
            })
            console.log('메시지 생성 완료')
            // Redis 캐시
            try {
                if (!redisClient.isOpen) {
                    await redisClient.connect()
                    console.log('Redis 연결 완료')
                }
                const redisKey = `chat:room:${chattingRoomId}`
                const safeNewMessage = convertBigIntsToNumbers(newMessage)
                await redisClient.rPush(redisKey, JSON.stringify(safeNewMessage))
                //최신 20개만 유지
                await redisClient.lTrim(redisKey, -20, -1)
            } catch (error) {
                throw new Error('redis 연결 실패', error)
            }

            return { coffeechat: newCoffeeChat, message: newMessage }
        })

        const safeMessage = convertBigIntsToNumbers(tx.message)
        try {
            io.to(`chat:${chattingRoomId}`).emit('receiveMessage', safeMessage)
        } catch (error) {
            console.log('소켓 통신 실패')
        }
        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(tx.coffeechat.id),
            sender_id: Number(senderId),
            receiver_id: Number(receiver_id),
            created_at: tx.coffeechat.created_at
        }
    },

    acceptCoffeechat: async ({ chattingRoomId, coffeechatId, senderId }) => {
        // 1. 커피챗 존재 확인
        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: BigInt(coffeechatId) }
        })
        if (!coffeechat) {
            throw new NotFoundError('존재하지 않는 커피챗 요청입니다.')
        }

        if (coffeechat.status !== 'PENDING') {
            throw new BadRequestError('이미 처리된 커피챗입니다.')
        }

        // 2. 수락자 검증
        if (coffeechat.receiver_id !== BigInt(senderId)) {
            throw new UnauthorizedError('해당 커피챗 요청의 수락자가 아닙니다.')
        }

        // 3. 상태 업데이트
        const updatedCoffeechat = await prisma.coffeeChat.update({
            where: { id: BigInt(coffeechatId) },
            data: { status: 'ACCEPTED' }
        })

        // 4. 메시지 생성
        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(senderId) }
        })
        const systemMessage = await prisma.message.create({
            data: {
                chat_id: BigInt(chattingRoomId),
                sender_id: BigInt(senderId),
                detail_message: `${senderService.name}님이 커피챗 요청을 수락하였습니다!`,
                type: 'SYSTEM'
            }
        })

        // 5. Redis 캐시 추가
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect()
            }
            const redisKey = `chat:room:${chattingRoomId}`
            await redisClient.rPush(redisKey, JSON.stringify(convertBigIntsToNumbers(systemMessage)))
            // Redis에 20개만 저장
            await redisClient.lTrim(redisKey, -20, -1)
        } catch (error) {
            console.log('Redis 캐시 저장 실패', error)
        }

        // 6. 소켓 전송
        try {
            const safeMsg = convertBigIntsToNumbers(systemMessage)
            io.to(`chat:${chattingRoomId}`).emit('receiveMessage', safeMsg)
        } catch (error) {
            console.log('소켓 전송 실패', error)
        }

        return {
            coffeechat_id: Number(coffeechatId),
            status: 'ACCEPTED'
        }
    }
}

export default coffeechatService