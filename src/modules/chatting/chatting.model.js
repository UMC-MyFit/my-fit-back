import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

const chattingModel = {
    createMessage: async ({ chattingRoomId, senderId, detail_message, type }) => {
        try {
            return await prisma.message.create({
                data: {
                    chat_id: BigInt(chattingRoomId),
                    sender_id: BigInt(senderId),
                    detail_message,
                    type,
                }
            })
        } catch (error) {
            console.error('prisma 메시지 생성 실패:', error)
            throw error
        }
    },

    getMessagesFromDB: async (chattingRoomId, offset) => {
        return await prisma.message.findMany({
            where: { chatting_room_id: chattingRoomId },
            orderBy: { created_at: 'desc' },
            skip: offset,
            take: 20,
        })
    }
}

export default chattingModel