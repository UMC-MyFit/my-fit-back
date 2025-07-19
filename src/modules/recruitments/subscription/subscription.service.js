import Subscription from './subscription.model.js'
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../../middlewares/error.js';

class SubscriptionService {
    async subscribeRecruitment(serviceId, recruimentId) {
        try {
            await Subscription.subscribe(serviceId, recruimentId)
            return
        }
        catch (error) {
            console.error('리크루팅 구독 오류:', error);
            throw error;
        }
    }
    async unSubscribeRecruitment(serviceId, recruimentId) {
        try {
            await Subscription.unSubscribe(serviceId, recruimentId)
            return
        }
        catch (error) {
            console.error('리크루팅 구독 취소 오류:', error);
            throw error;
        }
    }
}

export default new SubscriptionService();