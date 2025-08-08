import chattingModel from './chatting.model.js'
import redisClient from '../../libs/redisClient.js'
import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import { io } from '../../socket/socket.js'
import { calcAge } from '../../libs/calcAge.js'
import { NotFoundError } from '../../middlewares/error.js'
const prisma = new PrismaClient()

const chattingService = {
    checkOrCreateRoom: async (myServiceId, target_service_id) => {
        if (myServiceId === target_service_id) {
            throw new BadRequestError('자기 자신과는 채팅할 수 없습니다.')
        }

        // 0. 상대방 서비스 존재 여부 확인
        const targetService = await prisma.service.findUnique({
            where: { id: BigInt(target_service_id) }
        })
        if (!targetService) {
            throw new NotFoundError('존재하지 않는 service_id 입니다.')
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
            return {
                chatting_room_id: convertBigIntsToNumbers(existingRoom.id),
                is_new: false
            }
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
        console.log('새로운 채팅방 생성')
        return {
            chatting_room_id: convertBigIntsToNumbers(newRoom.id),
            is_new: true
        }

    },
    sendMessage: async ({ chattingRoomId, senderId, detail_message, type, tempId }) => {
        const chattingRoom = await prisma.chattingRoom.findUnique({
            where: { id: BigInt(chattingRoomId) },
        });

        if (!chattingRoom) {
            throw new BadRequestError('존재하지 않는 채팅방입니다.');
        }

        const isParticipant = await prisma.chat.findFirst({
            where: {
                chat_id: BigInt(chattingRoomId),
                service_id: BigInt(senderId),
            },
        });

        if (!isParticipant) {
            throw new BadRequestError('이 채팅방의 참여자가 아닙니다.');
        }

        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(senderId) },
            select: { name: true },
        });

        if (!senderService) {
            throw new BadRequestError('송신자 정보가 존재하지 않습니다.');
        }

        if (!chattingRoom.is_visible) {
            await prisma.chattingRoom.update({
                where: { id: BigInt(chattingRoomId) },
                data: { is_visible: true },
            });
        }

        const message = await chattingModel.createMessage({
            chattingRoomId,
            senderId,
            detail_message,
            type,
            sender_name: senderService.name,
        });

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const redisKey = `chat:room:${chattingRoomId}`;
        const safeMessage = convertBigIntsToNumbers(message);
        await redisClient.rPush(redisKey, JSON.stringify(safeMessage));
        await redisClient.lTrim(redisKey, -20, -1);

        try {
            const roomName = `chat:${chattingRoomId}`;
            console.log(`소켓 전송 시도: ${roomName}`, safeMessage);
            io.to(roomName).emit('receiveMessage', safeMessage);
            console.log('소켓 전송 성공');
        } catch (error) {
            console.error('소켓 전송 실패:', error);
        }

        return safeMessage;
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
    },
    getChatPartner: async (chattingRoomId, myServiceId) => {
        const chatRoom = await prisma.chattingRoom.findUnique({
            where: { id: BigInt(chattingRoomId) },
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
                }
            }
        })
        console.log('chatRoom 불러오기 성공')
        if (!chatRoom) {
            throw new BadRequestError('채팅방을 찾을 수 없습니다.')
        }

        const myId = BigInt(myServiceId)
        const partnerChat = chatRoom.chats.find(c => c.service_id !== myId)
        if (!partnerChat) {
            throw new BadRequestError('상대방 정보를 찾을 수 없습니다.')
        }
        console.log('partnerChat 불러오기 성공')
        const partnerService = partnerChat.service

        return convertBigIntsToNumbers({
            service_id: partnerChat.service_id,
            name: partnerService.name,
            profile_img: partnerService.profile_img
        })
    }
}

export default chattingService