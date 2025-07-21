import chattingModel from './chatting.model.js'
import redisClient from '../../libs/redisClient.js'
import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'

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
    sendMessage: async ({ chattingRoomId, senderId, content, type }) => {
        // 1. DB에 저장
        const message = await chattingModel.createMessage({
            chattingRoomId,
            senderId,
            content,
            type,
        })

        // 2. Redis 캐시 (최근 메시지 목록 등)
        const redisKey = `chat:room:${chattingRoomId}`
        await redisClient.rPush(redisKey, JSON, stringify(message))

        // 3. Socket.io로 해당 방에 전파 (emit은 socket.js에서 처리함)
        return message
    }
}

export default chattingService