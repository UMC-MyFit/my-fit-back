import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';

const prisma = new PrismaClient();

class Comment {
    static async create(commentData, serviceId, feedId) {
        try {
            const newComment = await prisma.feedComment.create({
                data: {
                    content: commentData.comment_text,
                    service_id: serviceId,
                    feed_id: feedId,
                    high_comment_id: commentData.high_comment_id
                }
            })
            const newCommentId = newComment.id
            return convertBigIntsToNumbers(newCommentId);
        } catch (error) {
            console.error('댓글 생성 중 데이터베이스 오류:', error);
            throw error;
        }
    }
    static async findAll(feedId, lastCommentId = null, limit = 10) {
        try {
            const baseCommentQueryOptions = {
                where: {
                    high_comment_id: null,
                },
                select: {
                    id: true,
                    created_at: true,
                    content: true,
                    high_comment_id: true,
                    service: {
                        select: {
                            id: true,
                            name: true,
                            sector: true,
                            profile_img: true
                        }
                    }
                },
                orderBy: [
                    { id: 'asc' }
                ],
                take: limit
            };

            // 커서 기반 페이지네이션
            if (lastCommentId !== null) {
                baseCommentQueryOptions.cursor = { id: BigInt(lastCommentId) };
                baseCommentQueryOptions.skip = 1;
            }

            const baseComments = await prisma.feedComment.findMany(baseCommentQueryOptions);
            const processedComments = [];
            for (const baseComment of baseComments) {
                const repliesComments = await prisma.feedComment.findMany({
                    where: {
                        high_comment_id: baseComment.id,
                    },
                    select: {
                        id: true,
                        created_at: true,
                        content: true,
                        high_comment_id: true,
                        service: {
                            select: {
                                id: true,
                                name: true,
                                sector: true,
                                profile_img: true
                            }
                        }
                    },
                    orderBy: [
                        { id: 'asc' }
                    ]
                });

                processedComments.push({
                    ...baseComment,
                    replies: repliesComments
                });
            }
            return convertBigIntsToNumbers(processedComments);
        }
        catch (error) {
            console.error('전체 댓글 목록 조회 중 오류:', error);
            throw error;
        }
    }
}

export default Comment;
