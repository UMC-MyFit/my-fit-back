import Comment from './feedComments.model.js'
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../middlewares/error.js';

class CommentService {
    async createComment(commentData, serviceId, feedId) {
        try {
            const createComment = Comment.create(commentData, serviceId, feedId)
            return createComment
        }
        catch (error) {
            console.error('댓글 생성 오류:', error)

            if (error?.code === 'P2003') {
                throw new NotFoundError({
                    message:
                        '해당 service_id에 해당하는 서비스가 존재하지 않습니다.',
                })
            }
            throw new InternalServerError({
                message: '댓글 등록 실패',
            })
        }
    }
    async getAllComment(feedId, lastCommentId = null, limit = 10) {
        try {
            const comments = Comment.findAll(feedId, lastCommentId, limit)
            return comments
        }
        catch (error) {
            console.error('전체 댓글 목록 조회 서비스 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
    async deleteComment(commentId, feedId, serviceId) {
        try {
            await Comment.delete(commentId, feedId, serviceId);
            return;
        }
        catch (error) {
            console.error('댓글 삭제 중 오류:', error);

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

export default new CommentService();