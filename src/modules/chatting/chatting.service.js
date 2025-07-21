import chattingModel from './chatting.model.js'
import redisClient from '../../libs/redisClient.js'
import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import { io } from '../../socket/socket.js'

const prisma = new PrismaClient()

const chattingService = {
    checkOrCreateRoom: async (myServiceId, target_service_id) => {
        if (myServiceId === target_service_id) {
            throw new BadRequestError('자기 자신과는 채팅할 수 없습니다.')
        }

        // 1. 기존 채팅방 존재 확인
        const existingRoom = await prisma.chattingRoom.findFirst({
            where: {
                AND: [
                    {
                        chats: {
                            some: {
                                service_id: myServiceId,
                            },
                        },
                    },
                    {
                        chats: {
                            some: {
                                service_id: target_service_id,
                            },
                        },
                    },
                ],
            },
            include: {
                chats: true,
            },
        })
        console.log('existingRoom:', existingRoom)

        const myId = BigInt(myServiceId)
        const targetId = BigInt(target_service_id)
        // 2. 이미 채팅방이 존재하면 채팅방 id 전달
        if (existingRoom &&
            existingRoom.chats.length === 2 &&
            existingRoom.chats.some(c => c.service_id === myId) &&
            existingRoom.chats.some(c => c.service_id === targetId)
        ) {
            console.log('이미 채팅장 존재')
            return convertBigIntsToNumbers(existingRoom.id)
        }


        // 3. 이미 채팅방이 존재하지 않는다면 채팅방 생성 후 채팅방 id 전달
        const newRoom = await prisma.chattingRoom.create({
            data: {
                chats: {
                    createMany: {
                        data: [
                            {
                                service_id: myServiceId,
                                last_read_time: new Date(),
                            },
                            {
                                service_id: target_service_id,
                                last_read_time: new Date(),
                            }
                        ]
                    }
                }
            }
        })
        console.log('채팅방 생성:', newRoom)
        return convertBigIntsToNumbers(newRoom.id)

    },
    sendMessage: async ({ chattingRoomId, senderId, detail_message, type }) => {

        // 0. 채팅방 존재 여부 및 참여자 확인
        const chattingRoom = await prisma.chattingRoom.findUnique({
            where: { id: BigInt(chattingRoomId) },
        })

        if (!chattingRoom) {
            throw new BadRequestError('존재하지 않는 채팅방입니다.')
        }

        const isParticipant = await prisma.chat.findFirst({
            where: {
                chat_id: BigInt(chattingRoomId),
                service_id: BigInt(senderId),
            }
        })
        console.log('채팅방 존재 여부 및 참여자 확인 완료')

        if (!isParticipant) {
            throw new BadRequestError('이 채팅방의 참여자가 아닙니다.')
        }
        // 1. DB에 저장
        const message = await chattingModel.createMessage({
            chattingRoomId,
            senderId,
            detail_message,
            type,

        })

        console.log('DB에 저장 완료')

        // 2. Redis 캐시 (최근 메시지 목록 등)
        if (!redisClient.isOpen) {
            await redisClient.connect()
            console.log('Redis 연결 완료')
        }
        const redisKey = `chat:room:${chattingRoomId}`
        const safeMessage = convertBigIntsToNumbers(message)
        await redisClient.rPush(redisKey, JSON.stringify(safeMessage))
        // 최신 20개만 유지
        await redisClient.lTrim(redisKey, -20, -1)

        console.log('Redis에 저장 완료')

        // 3. Socket.io로 해당 방에 전파 (emit은 socket.js에서 처리함)
        io.to(`chat:${chattingRoomId}`).emit('receiveMessage', safeMessage)
        console.log('소켓 emit 완료')
        return safeMessage
    },
    getMessages: async (chattingRoomId, offset) => {
        const redisKey = `chat:room:${chattingRoomId}`

        if (!redisClient.isOpen) {
            await redisClient.connect()
        }

        // 1. Redis에서 최신 20개 가져오기
        if (offset === 0) {
            const cached = await redisClient.lRange(redisKey, -20, -1)
            if (cached.length > 0) {
                console.log('Redis에서 메시지 조회')
                return cached.map(msg => JSON.parse(msg))
            }
        }

        // 2. MySQL에서 이후 메시지 가져오기
        console.log('MySQL에서 메시지 조회')
        const messages = await chattingModel.getMessagesFromDB(BigInt(chattingRoomId), offset)
        return messages.map(convertBigIntsToNumbers)

    }
}

export default chattingService