import notificationService from './notification.service.js'

const NotificationController = {
    getNotifications: async (req, res, next) => {
        try {
            const myServiceId = req.user.service_id
            const cursorParam = req.query.cursor ? BigInt(req.query.cursor) : null

            const result = await notificationService.getNotifications(BigInt(myServiceId), cursorParam)

            res.success({
                code: 200,
                message: '알림 목록 조회 성공',
                result: result
            })
        } catch (error) {
            next(error)
        }
    },
    getUnreadSummary: async (req, res, next) => {
        try {
            const myServiceId = BigInt(req.user.service_id)
            const result = await notificationService.getUnreadSummary(myServiceId)

            return res.success({
                code: 200,
                message: '미확인 알림 존재 여부 조회 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    readAll: async (req, res, next) => {
        try {
            const myServiceId = BigInt(req.user.service_id)
            const { updated_count } = await notificationService.readAll(myServiceId)

            res.success({
                code: 200,
                message: '알림 전체 읽음 처리 성공',
                result: {
                    updated_count,
                    has_unread: false
                }
            })
        }
        catch (error) {
            next(error)
        }
    }
}

export default NotificationController