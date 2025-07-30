import HeartService from './feedHearts.service.js';
import { BadRequestError, NotFoundError } from '../../middlewares/error.js';

class HeartController {
    async createHeart(req, res, next) {
        try {
            const serviceId = req.user.service_id
            const feedId = req.params.feedId;
            await HeartService.createHeart(serviceId, feedId)

            return res.success({
                code: 201,
                message: '하트가 등록되었습니다.',
                result: {
                    is_liked: true
                },
            });
        }
        catch (error) {
            console.error('하트 생성 중 오류:', error);
            next(error);
        }
    }

    async deleteHeart(req, res, next) {
        try {
            const serviceId = req.user.service_id
            const feedId = req.params.feedId;
            console.log(feedId)
            await HeartService.deleteHeart(serviceId, feedId)
            return res.success({
                code: 200,
                message: '하트가 삭제되었습니다.',
                result: {
                    is_liked: false
                },
            });
        }
        catch (error) {
            console.error('댓글 삭제 중 오류:', error);
            next(error);
        }
    }
}

export default new HeartController();
