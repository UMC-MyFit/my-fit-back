import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';
import { ForbiddenError, NotFoundError } from '../../middlewares/error.js'

const prisma = new PrismaClient();

class Heart {
    static async create(serviceId, feedId) {
        try {
            const feed = await prisma.Feed.findUnique({
                where: {
                    id: BigInt(feedId)
                }
            })

            if (feed === null) {
                throw new NotFoundError({ message: "삭제할 해당 피드를 찾을 수 없습니다." })
            }

            await prisma.FeedHeart.create({
                data: {
                    service_id: BigInt(serviceId),
                    feed_id: BigInt(feedId),
                }
            })
            return
        }
        catch (error) {
            console.error('하트 생성 중 데이터베이스 오류:', error);
            throw error;
        }
    }

    static async delete(serviceId, feedId) {
        try {
            console.log(feedId)
            const feed = await prisma.Feed.findUnique({
                where: {
                    id: BigInt(feedId)
                }
            })

            if (feed === null) {
                throw new NotFoundError({ message: "삭제할 해당 피드를 찾을 수 없습니다." })
            }

            await prisma.FeedHeart.delete({
                where: {
                    service_feed_id: {
                        service_id: BigInt(serviceId),
                        feed_id: BigInt(feedId)
                    }
                }
            });
            return;
        }
        catch (error) {
            console.error('하트 삭제 중 오류:', error);
            throw error;
        }
    }
}

export default Heart;