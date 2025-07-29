import { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundError, BadRequestError } from "./error.js";
const prisma = new PrismaClient();

export const validateChattingRoomParticipant = async (req, res, next) => {
    try {
        console.log('req.params:', req.params);
        console.log('req.body:', req.body);
        console.log('req.url:', req.url);
        const rawId = req.params.chattingRoomId || req.body.chatting_room_id;
        if (!rawId) {
            throw new BadRequestError("chattingRoomId가 전달되지 않았습니다.");
        }
        console.log('typeof rawId:', typeof rawId, 'value:', rawId);

        const chattingRoomId = BigInt(rawId);
        const serviceId = BigInt(req.user.service_id);

        const room = await prisma.chattingRoom.findUnique({
            where: { id: chattingRoomId },
        });

        if (!room) {
            throw new NotFoundError("존재하지 않는 채팅방입니다.");
        }

        const participant = await prisma.chat.findFirst({
            where: {
                chat_id: chattingRoomId,
                service_id: serviceId,
            },
        });

        if (!participant) {
            throw new ForbiddenError("해당 채팅방의 참여자가 아닙니다.");
        }

        next();
    } catch (error) {
        next(error);
    }
};