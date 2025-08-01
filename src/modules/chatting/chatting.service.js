import chattingModel from './chatting.model.js'
import redisClient from '../../libs/redisClient.js'
import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import { io } from '../../socket/socket.js'
import { calcAge } from '../../libs/calcAge.js'
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

        // 사용자 이름 조회
        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(senderId) },
            select: { name: true }
        })

        if (!senderService) {
            throw new BadRequestError('송신자 정보가 존재하지 않습니다.')
        }

        // 만약 is_visible이 false라면 true로 변경 (첫 메시지일 경우)
        if (!chattingRoom.is_visible) {
            await prisma.chattingRoom.update({
                where: { id: BigInt(chattingRoomId) },
                data: { is_visible: true }
            })
        }
        // 1. DB에 저장
        const message = await chattingModel.createMessage({
            chattingRoomId,
            senderId,
            detail_message,
            type,
            sender_name: senderService.name

        })


        // 2. Redis 캐시 (최근 메시지 목록 등)
        if (!redisClient.isOpen) {
            await redisClient.connect()
        }
        const redisKey = `chat:room:${chattingRoomId}`
        const safeMessage = convertBigIntsToNumbers(message)
        await redisClient.rPush(redisKey, JSON.stringify(safeMessage))
        // 최신 20개만 유지
        await redisClient.lTrim(redisKey, -20, -1)


        // 3. Socket.io로 해당 방에 전파 (emit은 socket.js에서 처리함)
        io.to(`chat:${chattingRoomId}`).emit('receiveMessage', safeMessage)
        return safeMessage
    },
    getMessages: async (chattingRoomId, cursor) => {
        const TAKE_LIMIT = 20;
        const redisKey = `chat:room:${chattingRoomId}`

        if (!redisClient.isOpen) {
            await redisClient.connect()
        }

        // 1. 최신 20개 (cursor가 없을 때만 Redis 캐시 사용)

        if (!cursor) {
            const cached = await redisClient.lRange(redisKey, -TAKE_LIMIT, -1)
            if (cached.length) {
                const msgs = cached.map(JSON.parse).reverse();
                const nextCursor = msgs.length === TAKE_LIMIT ? msgs[msgs.length - 1].id : null;
                return convertBigIntsToNumbers({
                    chatting_room_id: Number(chattingRoomId),
                    messages: msgs,
                    next_cursor: nextCursor,
                    has_next: !!nextCursor
                })
            }
        }

        // 2. MySQL에서 이후 메시지 가져오기
        const whereClause = {
            chat_id: BigInt(chattingRoomId),
            ...(cursor && { id: { lt: BigInt(cursor) } })
        }

        const dbMessages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { id: 'desc' },
            take: TAKE_LIMIT
        })

        const formatted = dbMessages.map(convertBigIntsToNumbers)

        // 3. 페이징 정보 계산
        const nextCursor = formatted.length === TAKE_LIMIT ? formatted[formatted.length - 1].id : null;

        return {
            chatting_room_id: Number(chattingRoomId),
            messages: formatted,
            next_cursor: nextCursor,
            has_next: !!nextCursor
        }
    },
    getChattingRooms: async (myServiceId, cursor) => {
        const take = 10 // 한 번에 10개씩

        const chats = await prisma.chat.findMany({
            where: {
                service_id: myServiceId,
                chatRoom: {
                    is_visible: true
                },
                ...(cursor && { chat_id: { lt: cursor } })
            },
            orderBy: { chat_id: 'desc' },
            take,
            include: {
                chatRoom: {
                    include: {
                        chats: {
                            include: {
                                service: {
                                    include: {
                                        userDBs: {
                                            include: { user: true }
                                        }
                                    }
                                }
                            }
                        },
                        messages: {
                            orderBy: { created_at: 'desc' },
                            take: 1,
                        }
                    }
                }
            }
        });
        const myId = BigInt(myServiceId)
        const formatted = chats.map(chat => {
            const chatRoom = chat.chatRoom
            const partnerChat = chatRoom.chats.find(c => c.service_id !== myId)
            const partner = chatRoom.chats.find(c => c.service_id !== myId)?.service
            const lastMessage = chatRoom.messages[0]

            return convertBigIntsToNumbers({
                chatting_room_id: chat.chat_id,
                partner: {
                    service_id: partnerChat?.service_id || null,
                    name: partner?.name || '',
                    age: partner ? calcAge(partner.userDBs?.[0]?.user?.birth_date) : null,
                    low_sector: partner?.low_sector || '',
                    profile_image: partner?.profile_img || '',
                },
                last_message: lastMessage
                    ? {
                        message: lastMessage.detail_message,
                        created_at: lastMessage.created_at,
                    }
                    : null,
            })
        })

        // next_cursor 설정
        const nextCursor = chats.length === take ? chats[chats.length - 1].chat_id : null

        return {
            chatting_rooms: formatted,
            next_cursor: nextCursor,
        }
    }
}

export default chattingService