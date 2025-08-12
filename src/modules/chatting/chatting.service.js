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

        // 1) 최신 20개 (cursor가 없을 때만 Redis 캐시 사용)
        if (!cursor) {
            const cached = await redisClient.lRange(redisKey, -TAKE_LIMIT, -1)
            if (cached.length) {
                const msgs = cached.map(JSON.parse).reverse();

                // Redis에 status가 없을 수 있으니 보충
                const need = msgs.filter(m => m.type === 'COFFEECHAT' && !m.status && m.coffeechat_id)
                if (need.length) {
                    const ids = [...new Set(need.map(m => BigInt(m.coffeechat_id)))]
                    const ccList = await prisma.coffeeChat.findMany({
                        where: { id: { in: ids } },
                        select: { id: true, status: true }
                    })
                    const statusMap = new Map(ccList.map(cc => [Number(cc.id), cc.status]))
                    for (const m of msgs) {
                        if (m.type === 'COFFEECHAT' && !m.status && m.coffeechat_id) {
                            m.status = statusMap.get(Number(m.coffeechat_id)) ?? null
                        } else if (m.type !== 'COFFEECHAT') {
                            m.status = null
                        }
                    }
                } else {
                    // TEXT 등은 null 보장
                    for (const m of msgs) if (m.type !== 'COFFEECHAT') m.status = null
                }

                const nextCursor = msgs.length === TAKE_LIMIT ? msgs[msgs.length - 1].id : null;
                return convertBigIntsToNumbers({
                    chatting_room_id: Number(chattingRoomId),
                    messages: msgs,
                    next_cursor: nextCursor,
                    has_next: !!nextCursor
                })
            }
        }

        // 2) MySQL에서 이후 메시지 가져오기
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

        // COFFEECHAT 메시지들의 상태 일괄 조회 후 매핑
        const ccIds = [...new Set(
            formatted
                .filter(m => m.type === 'COFFEECHAT' && m.coffeechat_id)
                .map(m => BigInt(m.coffeechat_id))
        )]

        let statusMap = new Map()
        if (ccIds.length) {
            const ccList = await prisma.coffeeChat.findMany({
                where: { id: { in: ccIds } },
                select: { id: true, status: true }
            })
            statusMap = new Map(ccList.map(cc => [Number(cc.id), cc.status]))
        }

        const withStatus = formatted.map(m => ({
            ...m,
            status: m.type === 'COFFEECHAT'
                ? (statusMap.get(Number(m.coffeechat_id)) ?? null)
                : null
        }))

        // 3) 페이징 정보 계산
        const nextCursor = withStatus.length === TAKE_LIMIT
            ? withStatus[withStatus.length - 1].id
            : null;

        return {
            chatting_room_id: Number(chattingRoomId),
            messages: withStatus,
            next_cursor: nextCursor,
            has_next: !!nextCursor
        }
    },
    getChattingRooms: async (myServiceId, cursor) => {
        const take = 10;

        // 1) DB에선 일단 방을 "id desc"로, 나에게 보이는 방만 가져온다
        const rooms = await prisma.chattingRoom.findMany({
            where: {
                is_visible: true,
                chats: { some: { service_id: BigInt(myServiceId) } },
                ...(cursor ? { id: { lt: BigInt(cursor) } } : {}),
            },
            orderBy: { id: 'desc' },
            take: 50,
            include: {
                chats: {
                    include: {
                        service: {
                            include: {
                                userDBs: { include: { user: true } },
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                },
            },
        });

        const myId = BigInt(myServiceId);

        // 2) JS에서 최근메시지 시간으로 정렬
        rooms.sort((a, b) => {
            const aTime = a.messages[0]?.created_at ? new Date(a.messages[0].created_at).getTime() : 0;
            const bTime = b.messages[0]?.created_at ? new Date(b.messages[0].created_at).getTime() : 0;
            return bTime - aTime;
        });

        // 3) 실제로 반환할 10개만 자르기
        const picked = rooms.slice(0, take);

        // 4) 변환
        const result = picked.map((room) => {
            const partnerChat = room.chats.find((c) => c.service_id !== myId);
            const partner = partnerChat?.service;
            const userInfo = partner?.userDBs?.[0]?.user;
            const lastMessage = room.messages?.[0] || null;

            return convertBigIntsToNumbers({
                chatting_room_id: room.id,
                partner: {
                    service_id: partnerChat?.service_id ?? null,
                    name: partner?.name ?? '',
                    age: partner ? calcAge(userInfo?.birth_date) : null,
                    low_sector: partner?.low_sector ?? '',
                    profile_image: partner?.profile_img ?? '',
                    division: userInfo?.division ?? null,
                },
                last_message: lastMessage
                    ? {
                        message: lastMessage.detail_message,
                        sender_name: lastMessage.sender_name,
                        type: lastMessage.type,
                        created_at: lastMessage.created_at,
                    }
                    : null,
            });
        });

        // 5) next_cursor는 마지막으로 반환한 방의 id (id 기반 커서)
        const nextCursor = picked.length === take ? Number(picked[picked.length - 1].id) : null;

        return {
            chatting_rooms: result,
            next_cursor: nextCursor,
        };
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