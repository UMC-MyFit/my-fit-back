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
}

export default Comment;