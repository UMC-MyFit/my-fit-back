import Heart from './feedHearts.model.js'
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../middlewares/error.js';
import { NotificationType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

class HeartService {
    async createHeart(serviceId, feedId) {
        try {
            await Heart.create(serviceId, feedId)

            // 알림 생성
            try {
                const feed = await prisma.feed.findUnique({
                    where: { id: BigInt(feedId) },
                    select: { service_id: true },
                })
                if (!feed) return
                if (feed.service_id === BigInt(serviceId)) return // 자기 글이면 알림 X

                const sender = await prisma.service.findUnique({
                    where: { id: BigInt(serviceId) },
                    select: { name: true }
                })

                await prisma.notification.create({
                    data: {
                        receiver_id: feed.service_id,
                        sender_id: BigInt(serviceId),
                        type: NotificationType.FEED,
                        feed_id: BigInt(feedId),
                        message: `${sender?.name}님이 회원님의 글을 좋아합니다.`
                    }
                })
            } catch (error) {
                console.log('좋아요 알림 생성 실패', error)
            }
            return
        }
        catch (error) {
            console.error('하트 생성 오류:', error)

            if (error?.code === 'P2003') {
                throw new NotFoundError({
                    message:
                        '해당 service_id에 해당하는 서비스가 존재하지 않습니다.',
                })
            }
            throw new InternalServerError({
                message: '하트 등록 실패',
            })
        }
    }
    async deleteHeart(serviceId, feedId) {
        try {
            console.log(feedId)
            await Heart.delete(serviceId, feedId)
            return
        }
        catch (error) {
            console.error('하트 삭제 중 오류:', error);

            if (error.code === 'P2025') {
                throw new NotFoundError({ message: '삭제할 피드를 찾을 수 없습니다.' });
            }
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default new HeartService();
