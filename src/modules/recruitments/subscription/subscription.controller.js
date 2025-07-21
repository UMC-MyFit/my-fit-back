import subscriptionService from "./subscription.service.js"

class SubscriptionController {
    async subscribeRecruitment(req, res, next) {
        try {
            const recruitmentId = req.params.recruitmentId
            const serviceId = req.user.service_id
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
    async getSubscribedRecruitments(req, res, next) {
        try {
            const limit = 10
            const serviceId = req.user.service_id
            const lastRecruimentId = req.query.cursor ? parseInt(req.query.cursor) : null;
            const subscribedRecruitments = await subscriptionService.getSubscribedRecruitments(serviceId, lastRecruimentId, limit)
            const hasMore = subscribedRecruitments.length === limit;
            const nextCursorId = hasMore && subscribedRecruitments.length > 0 ? subscribedRecruitments[subscribedRecruitments.length - 1].id : null;
            res.success({
                code: 200,
                message: '구독한 리크루팅 목록 조회 성공',
                result: {
                    subscribedRecruitments,
                    pagination: {
                        hasMore,
                        nextCursorId
                    }
                }
            });
        }
        catch (error) {
            console.error('구독한 리크루팅 목록 조회 중 오류:', error);
            next(error);
        }
    }
}

export default new SubscriptionController();
