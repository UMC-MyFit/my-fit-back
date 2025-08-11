import { PrismaClient } from "@prisma/client";
import { convertBigIntsToNumbers } from "../../libs/dataTransformer.js";
const prisma = new PrismaClient();

const notificationService = {
    getNotifications: async (myServiceId, cursor = null) => {
        const TAKE = 20;

        const items = await prisma.notification.findMany({
            where: { receiver_id: myServiceId },
            orderBy: { id: "desc" },
            take: TAKE,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                sender: { select: { id: true, name: true, profile_img: true } },
            },
        });

        const nextCursor = items.length === TAKE ? items[items.length - 1].id : null;

        const mapped = items.map((n) => ({
            notification_id: n.id,
            receiver_id: n.receiver_id,
            sender_id: n.sender_id,
            type: n.type,
            feed_id: n.feed_id,
            message: n.message,
            is_read: n.is_read,
            created_at: n.created_at,
            read_at: n.read_at,
            sender: {
                service_id: n.sender.id,
                name: n.sender.name,
                profile_img: n.sender.profile_img,
            },
        }));

        return convertBigIntsToNumbers({
            notifications: mapped,
            next_cursor: nextCursor ? Number(nextCursor) : null,
            has_next: !!nextCursor,
        });
    },

    getUnreadSummary: async (myServiceId) => {
        const unreadCount = await prisma.notification.count({
            where: {
                receiver_id: myServiceId,
                is_read: false,
            }
        })

        return {
            has_unread: unreadCount > 0,
            unread_count: unreadCount,
        }
    },
    readAll: async (myServiceId) => {
        const now = new Date()

        const result = await prisma.notification.updateMany({
            where: { receiver_id: myServiceId, is_read: false },
            data: { is_read: true, read_at: now }
        })

        return { updated_count: result.count }
    }
};

export default notificationService;