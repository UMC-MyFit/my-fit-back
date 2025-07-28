import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import redisClient from '../../libs/redisClient.js'
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
        console.log('service 진입')
        const tx = await prisma.$transaction(async tx => {
            console.log('트랜잭션 진입')
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
            console.log('커피챗 생성 완료')

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
                console.log('Redis에 저장 완료')
            } catch (error) {
                throw new Error('redis 연결 실패', error)
            }

            return { coffeechat: newCoffeeChat, message: newMessage }
        })

        const safeMessage = convertBigIntsToNumbers(tx.message)
        io.to(`chat:${chattingRoomId}`).emit('receiveMessage', safeMessage)

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(tx.coffeechat.id),
            sender_id: Number(senderId),
            receiver_id: Number(receiver_id),
            created_at: tx.coffeechat.created_at
        }
    }
}

export default coffeechatService