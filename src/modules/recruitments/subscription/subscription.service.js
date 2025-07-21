import Subscription from './subscription.model.js'
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../../middlewares/error.js';

class SubscriptionService {
    async subscribeRecruitment(serviceId, recruitmentId) {
        try {
            await Subscription.subscribe(serviceId, recruitmentId)
            return
        }
        catch (error) {
            console.error('리크루팅 구독 오류:', error);
            throw error;
        }
    }
    async unSubscribeRecruitment(serviceId, recruitmentId) {
        try {
            await Subscription.unSubscribe(serviceId, recruitmentId)
            return
        }
        catch (error) {
            console.error('리크루팅 구독 취소 오류:', error);
            throw error;
        }
    }
    async getSubscribedRecruitments(serviceId, lastRecruimentId, limit) {
        try {
            const subscribedRecruitments = await Subscription.getSubscribedRecruitments(serviceId, lastRecruimentId, limit)
            return subscribedRecruitments
        }
        catch (error) {
            console.error('구독한 리크루팅 목록 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default new SubscriptionService();