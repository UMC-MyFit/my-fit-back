import CommentService from "./feedComments.service.js";
import { BadRequestError, NotFoundError } from '../../middlewares/error.js';

class CommentController {
    async createComment(req, res, next) {
        try {
            const serviceId = req.user.service_id
            const commentData = req.body
            const feedId = req.params.feedId;

            if (!commentData.comment_text) {
                throw new BadRequestError({
                    field: 'comment_text',
                    message: '댓글 텍스트는 필수입니다.'
                })
            }

            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({
                    field: 'feedId',
                    message: '유효한 피드 ID가 필요합니다.'
                })
            }

            const result = await CommentService.createComment(commentData, serviceId, feedId)

            res.success({
                code: 201,
                message: "댓글 등록이 완료되었습니다.",
                result: {
                    comment_id: result
                }
            })
        }
        catch (error) {
            console.error('댓글 생성 중 오류:', error);
            next(error);
        }
    }
}

export default new CommentController();