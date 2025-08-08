import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const chattingModel = {
    createMessage: async ({ chattingRoomId, senderId, detail_message, type, sender_name }) => {
        try {
            return await prisma.message.create({
                data: {
                    chat_id: BigInt(chattingRoomId),
                    sender_id: BigInt(senderId),
                    detail_message,
                    type,
                    sender_name,
                },
                select: {
                    id: true,
                    chat_id: true,
                    sender_id: true,
                    sender_name: true,
                    detail_message: true,
                    type: true,
                    created_at: true,
                },
            });
        } catch (error) {
            console.error('prisma 메시지 생성 실패:', error);
            throw error;
        }
    },

    getMessagesFromDB: async (chattingRoomId, offset) => {
        const messages = await prisma.message.findMany({
            where: { chat_id: chattingRoomId },
            orderBy: { created_at: 'desc' },
            skip: offset,
            take: 20,
        });
        return messages || [];
    },
};

export default chattingModel;
