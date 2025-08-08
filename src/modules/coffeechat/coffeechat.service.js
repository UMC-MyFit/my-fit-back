import { PrismaClient } from '@prisma/client'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import redisClient from '../../libs/redisClient.js'
import { io } from '../../socket/socket.js'
import { calcAge } from '../../libs/calcAge.js'
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
    requestCoffeechat: async ({ chattingRoomId, senderId, title, scheduled_at, place }) => {

        const tx = await prisma.$transaction(async tx => {
            const chats = await tx.chat.findMany({
                where: { chat_id: BigInt(chattingRoomId) },
                select: { service_id: true }
            })

            const myId = BigInt(senderId)
            const receiverId = chats.find(chat => chat.service_id != myId)?.service_id
            if (!receiverId) {
                throw new BadRequestError('상대방을 찾을 수 없습니다.')
            }
            // 1. 커피챗 생성
            const newCoffeeChat = await tx.coffeeChat.create({
                data: {
                    requester_id: BigInt(myId),
                    receiver_id: BigInt(receiverId),
                    title,
                    scheduled_at: new Date(scheduled_at),
                    place,
                    chat_id: chattingRoomId
                }
            });

            const senderService = await tx.service.findUnique({
                where: { id: BigInt(senderId) },
                select: { name: true }
            })

            // 2. 메시지 생성 및 Redis 캐시 (type: COFFEECHAT)
            const newMessage = await tx.message.create({
                data: {
                    chat_id: BigInt(chattingRoomId),
                    sender_id: BigInt(senderId),
                    sender_name: senderService.name,
                    detail_message: '님이 커피챗을 요청하였습니다!',
                    type: 'COFFEECHAT',
                    coffeechat_id: newCoffeeChat.id
                }
            });

            // 3. ChattingRoom is_visible 처리
            const chattingRoom = await tx.chattingRoom.findUnique({
                where: { id: BigInt(chattingRoomId) }
            });
            if (!chattingRoom) {
                throw new NotFoundError('채팅방이 존재하지 않습니다.');
            }

            if (!chattingRoom.is_visible) {
                await tx.chattingRoom.update({
                    where: { id: BigInt(chattingRoomId) },
                    data: { is_visible: true }
                });
            }

            // Redis 캐시 처리
            try {
                if (!redisClient.isOpen) {
                    await redisClient.connect();
                }

                const redisKey = `chat:room:${chattingRoomId}`;
                const safeNewMessage = convertBigIntsToNumbers(newMessage);
                await redisClient.rPush(redisKey, JSON.stringify(safeNewMessage));
                await redisClient.lTrim(redisKey, -20, -1);
            } catch (error) {
                throw new Error('redis 연결 실패', error);
            }

            return { coffeechat: newCoffeeChat, message: newMessage, receiverId };
        });

        const { coffeechat, message, receiverId } = tx;
        const safeMessage = convertBigIntsToNumbers(message);

        try {
            const roomName = `chat:${chattingRoomId}`
            console.log(`소켓 전송 시도: ${roomName}`, safeMessage)
            io.to(roomName).emit('receiveMessage', safeMessage);
            console.log('소켓 전송 성공')
        } catch (error) {
            console.error("❌ 소켓 emit 실패", error);
        }

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(coffeechat.id),
            sender_id: Number(senderId),
            receiver_id: Number(receiverId),
            created_at: coffeechat.created_at
        };
    },


    acceptCoffeechat: async ({ chattingRoomId, coffeechat_id, senderId }) => {

        // 1. 커피챗 존재 확인
        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: BigInt(coffeechat_id) }
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
        await prisma.coffeeChat.update({
            where: { id: BigInt(coffeechat_id) },
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
                sender_name: senderService.name,
                detail_message: `님이 커피챗 요청을 수락하였습니다!`,
                type: 'COFFEECHAT',
                coffeechat_id: BigInt(coffeechat_id)
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
            const roomName = `chat:${chattingRoomId}`
            console.log(`소켓 전송 시도: ${roomName}`, safeMsg)
            io.to(roomName).emit('receiveMessage', safeMsg)
            console.log('소켓 전송 성공')
        } catch (error) {
            console.error('소켓 전송 실패', error)
        }

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(coffeechat_id),
            sender_id: Number(senderId),
            receiver_id: Number(coffeechat.requester_id),
            created_at: coffeechat.created_at
        }
    },

    rejectCoffeechat: async ({ chattingRoomId, coffeechat_id, senderId }) => {

        // 1. 커피챗 존재 확인
        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: BigInt(coffeechat_id) }
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
        await prisma.coffeeChat.update({
            where: { id: BigInt(coffeechat_id) },
            data: { status: 'REJECTED' }
        })

        // 4. 메시지 생성
        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(senderId) }
        })
        const systemMessage = await prisma.message.create({
            data: {
                chat_id: BigInt(chattingRoomId),
                sender_id: BigInt(senderId),
                sender_name: senderService.name,
                detail_message: '님이 커피챗 요청을 거절하였습니다!',
                type: 'COFFEECHAT',
                coffeechat_id: BigInt(coffeechat_id)
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
            const roomName = `chat:${chattingRoomId}`
            console.log(`소켓 전송 시도: ${roomName}`, safeMsg)
            io.to(roomName).emit('receiveMessage', safeMsg)
            console.log('소켓 전송 성공')
        } catch (error) {
            console.error('소켓 전송 실패', error)
        }

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(coffeechat_id),
            sender_id: Number(senderId),
            receiver_id: Number(coffeechat.requester_id),
            created_at: coffeechat.created_at
        }
    },
    updateCoffeechat: async ({ chattingRoomId, coffeechat_id, senderId, title, scheduled_at, place }) => {

        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: BigInt(coffeechat_id) }
        })
        if (!coffeechat) {
            throw new NotFoundError('존재하지 않는 커피챗 요청입니다.')
        }

        const updated = await prisma.coffeeChat.update({
            where: { id: BigInt(coffeechat_id) },
            data: {
                title,
                scheduled_at: new Date(scheduled_at),
                place
            }
        })

        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(senderId) }
        })

        const systemMessage = await prisma.message.create({
            data: {
                chat_id: BigInt(chattingRoomId),
                sender_id: BigInt(senderId),
                sender_name: senderService.name,
                detail_message: `님이 커피챗 요청을 수정하였습니다.`,
                type: 'COFFEECHAT',
                coffeechat_id: BigInt(coffeechat_id)
            }
        })

        // Redis 캐시 추가
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect()
            }
            const redisKey = `chat:room:${chattingRoomId}`
            await redisClient.rPush(redisKey, JSON.stringify(convertBigIntsToNumbers(systemMessage)))
            await redisClient.lTrim(redisKey, -20, -1)
        } catch (error) {
            console.log('Redis 저장 실패:', error)
        }

        // 소켓 전송
        try {
            const safeMsg = convertBigIntsToNumbers(systemMessage)
            const roomName = `chat:${chattingRoomId}`
            console.log(`소켓 전송 시도: ${roomName}`, safeMsg)
            io.to(roomName).emit('receiveMessage', safeMsg)
            console.log('소켓 전송 성공')
        } catch (error) {
            console.error('소켓 전송 실패:', error)
        }

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(updated.id),
            sender_id: Number(senderId),
            receiver_id: Number(coffeechat.receiver_id),
            created_at: updated.created_at
        }
    },
    cancelCoffeechat: async ({ chattingRoomId, coffeechat_id, serviceId }) => {

        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: BigInt(coffeechat_id) }
        })
        if (!coffeechat) {
            throw new NotFoundError('존재하지 않는 커피챗 요청입니다.')
        }

        // 커피챗 송신자, 수신자만 취소 가능
        const isRequester = coffeechat.requester_id === BigInt(serviceId)
        const isReceiver = coffeechat.receiver_id === BigInt(serviceId)

        if (!isRequester && !isReceiver) {
            throw new UnauthorizedError('해당 커피챗 요청자 또는 수신자만 취소할 수 있습니다.')
        }

        // 1. 상태 업데이트
        await prisma.coffeeChat.update({
            where: { id: BigInt(coffeechat_id) },
            data: { status: 'CANCELED' },
        })

        // 2. 시스템 메시지 생성
        const senderService = await prisma.service.findUnique({
            where: { id: BigInt(serviceId) }
        })

        const systemMessage = await prisma.message.create({
            data: {
                chat_id: BigInt(chattingRoomId),
                sender_id: BigInt(serviceId),
                sender_name: senderService.name,
                detail_message: `님이 커피챗 요청을 취소하였습니다.`,
                type: 'COFFEECHAT',
                coffeechat_id: BigInt(coffeechat_id)
            },
        })

        // 3. Redis 캐시
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect()
            }
            const redisKey = `chat:room:${chattingRoomId}`
            await redisClient.rPush(redisKey, JSON.stringify(convertBigIntsToNumbers(systemMessage)))
            await redisClient.lTrim(redisKey, -20, -1)
        }
        catch (error) {
            console.log('Redis 저장 실패:', error)
        }

        // 4. 소켓 전송
        try {
            const safeMsg = convertBigIntsToNumbers(systemMessage)
            const roomName = `chat:${chattingRoomId}`
            console.log(`소켓 전송 시도: ${roomName}`, safeMsg)
            io.to(roomName).emit('receiveMessage', safeMsg)
            console.log('소켓 전송 성공')
        }
        catch (error) {
            console.error('소켓 전송 실패:', error)
        }

        return {
            chatting_room_id: Number(chattingRoomId),
            coffeechat_id: Number(coffeechat_id),
            sender_id: Number(serviceId),
            receiver_id: Number(isRequester ? coffeechat.receiver_id : coffeechat.requester_id),
            created_at: coffeechat.created_at
        }
    },
    getUpcomingCoffeechats: async (myServiceId, cursor) => {

        const TAKE = 10;

        const whereClause = {
            status: 'ACCEPTED',
            scheduled_at: { gte: new Date() }, //현재 시각 이후
            OR: [
                { requester_id: myServiceId },
                { receiver_id: myServiceId }
            ],
            ...(cursor && { id: { lt: cursor } })
        }

        const chats = await prisma.coffeeChat.findMany({
            where: whereClause,
            orderBy: { scheduled_at: 'asc' },
            take: TAKE,
            include: {
                receiver: {
                    include: {
                        userDBs: {
                            include: { user: true }
                        }
                    }
                },
                requester: {
                    include: {
                        userDBs: {
                            include: { user: true }
                        }
                    }
                }
            }
        })

        const formatted = chats.map(chat => {
            const isRequester = Number(chat.requester_id) === Number(myServiceId)
            const opponent = isRequester ? chat.receiver : chat.requester

            return {
                coffeechat_id: chat.id,
                chatting_room_id: chat.chat_id,
                opponent: {
                    name: opponent.name,
                    age: calcAge(opponent.userDBs[0]?.user.birth_date),
                    job: opponent.low_sector,
                    profile_img: opponent.profile_img
                },
                scheduled_at: chat.scheduled_at,
                place: chat.place
            }
        })
        const nextCursor = chats.length === TAKE ? chats[chats.length - 1].id : null;

        return convertBigIntsToNumbers({
            coffeechats: formatted,
            next_cursor: nextCursor,
            has_next: !!nextCursor
        });
    },
    getCoffeeChatArchive: async (myServiceId, page) => {
        const limit = 5
        const skip = (page - 1) * limit
        const now = new Date()

        try {
            const chats = await prisma.coffeeChat.findMany({
                where: {
                    status: 'ACCEPTED',
                    scheduled_at: { lt: now },
                    OR: [
                        { requester_id: myServiceId },
                        { receiver_id: myServiceId }
                    ]
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip,
                take: limit,
                include: {
                    requester: {
                        include: {
                            userDBs: {
                                include: { user: true }
                            }
                        }
                    },
                    receiver: {
                        include: {
                            userDBs: {
                                include: { user: true }
                            }
                        }
                    }
                }
            })

            const formatted = chats.map(chat => {
                const isRequester = Number(chat.requester_id) === Number(myServiceId)
                const opponent = isRequester ? chat.receiver : chat.requester

                return {
                    coffeechat_id: chat.id,
                    chatting_room_id: chat.chat_id,
                    opponent: {
                        name: opponent.name,
                        age: calcAge(opponent.userDBs[0]?.user.birth_date),
                        job: opponent.low_sector,
                        profile_img: opponent.profile_img
                    },
                    scheduled_at: chat.scheduled_at,
                    place: chat.place
                }
            })

            const totalCount = await prisma.coffeeChat.count({
                where: {
                    status: 'ACCEPTED',
                    scheduled_at: { lt: now },
                    OR: [
                        { requester_id: myServiceId },
                        { receiver_id: myServiceId },
                    ],
                },
            })

            const totalPages = Math.ceil(totalCount / limit)

            return convertBigIntsToNumbers({
                chats: formatted,
                currentPage: page,
                totalPages
            })
        } catch (error) {
            console.error('커피챗 보관함 조회 실패:', error)
            throw error
        }
    },
    getCoffeeChatDetail: async ({ chattingRoomId, coffeechatId, myServiceId }) => {
        const coffeechat = await prisma.coffeeChat.findUnique({
            where: { id: coffeechatId },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true
                    }
                }
            }
        })

        if (!coffeechat) {
            throw new NotFoundError('존재하지 않는 커피챗 요청입니다.')
        }

        if (
            coffeechat.chat_id !== BigInt(chattingRoomId) ||
            (coffeechat.requester_id !== BigInt(myServiceId) && coffeechat.receiver_id !== BigInt(myServiceId))
        ) {
            throw new UnauthorizedError('해당 커피챗에 접근할 권한이 없습니다.')
        }

        return {
            coffeechat_id: Number(coffeechat.id),
            chatting_room_id: Number(coffeechat.chat_id),
            sender: {
                id: Number(coffeechat.requester.id),
                name: coffeechat.requester.name,
                profile_img: coffeechat.requester.profile_img
            },
            receiver: {
                id: Number(coffeechat.receiver.id),
                name: coffeechat.receiver.name,
                profile_img: coffeechat.receiver.profile_img
            },
            title: coffeechat.title,
            place: coffeechat.place,
            scheduled_at: coffeechat.scheduled_at,
            status: coffeechat.status,
            created_at: coffeechat.created_at,
            accepted_at: coffeechat.accepted_at
        }
    }
}

export default coffeechatService