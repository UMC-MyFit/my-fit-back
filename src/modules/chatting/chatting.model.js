import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

const chattingModel = {
    createMessage: async ({ chattingRoomId, senderId, content, type }) => {
        return await prisma.message.create({
            data: {
                chatting_room_id: BigInt(chattingRoomId),
                sender_id: BigInt(senderId),
                content,
                type,
            }
        })
    }
}

export default chattingModel