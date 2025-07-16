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
}

export default new CommentService();