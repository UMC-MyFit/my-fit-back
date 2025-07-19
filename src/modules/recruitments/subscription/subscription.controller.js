import subscriptionService from "./subscription.service.js"

class SubscriptionController {
    async subscribeRecruitment(req, res, next) {
        try {
            const recruitmentId = req.params.recruitmentId
            const serviceId = req.user.service_id
            console.log(recruitmentId)
            await subscriptionService.subscribeRecruitment(serviceId, recruitmentId)
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
            const recruitmentId = req.params.recruitmentId
            const serviceId = req.user.service_id
            await subscriptionService.unSubscribeRecruitment(serviceId, recruitmentId)
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
