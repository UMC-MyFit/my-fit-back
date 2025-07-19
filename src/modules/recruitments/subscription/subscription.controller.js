import subscriptionService from "./subscription.service.js"

class SubscriptionController {
    async subscribeRecruitment(req, res, next) {
        try {
            const recruimentId = req.params.recruimentId
            const serviceId = req.user.service_id
            console.log(recruimentId)
            await subscriptionService.subscribeRecruitment(serviceId, recruimentId)
            res.success({
                code: 201,
                message: '구독이 완료되었습니다.',
            });
        }
        catch (error) {
            console.error('리크루팅 구독 중 오류:', error);
            next(error);
        }
    }
    async unSubscribeRecruitment(req, res, next) {
        try {
            const recruimentId = req.params.recruimentId
            const serviceId = req.user.service_id
            await subscriptionService.unSubscribeRecruitment(serviceId, recruimentId)
            res.success({
                code: 200,
                message: '구독이 취소되었습니다.',
            });
        }
        catch (error) {
            console.error('리크루팅 구독 취소 중 오류:', error);
            next(error);
        }
    }
}

export default new SubscriptionController();
