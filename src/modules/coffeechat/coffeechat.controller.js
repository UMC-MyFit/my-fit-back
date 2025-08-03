import coffeechatService from './coffeechat.service.js'
import { BadRequestError } from '../../middlewares/error.js'
export const coffeechatController = {
    getCoffeeChatPreview: async (req, res, next) => {
        try {
            const chattingRoomId = Number(req.params.chattingRoomId)
            if (!chattingRoomId) {
                throw new BadRequestError('chattingRoomId가 유효하지 않습니다.')
            }
            const result = await coffeechatService.getCoffeeChatPreview(chattingRoomId)

            res.success({
                code: 200,
                message: '커피챗 요청 미리보기 조회 성공',
                result,
            })
        } catch (error) {
            next(error)
        }
    },
    requestCoffeechat: async (req, res, next) => {
        try {
            const chattingRoomId = BigInt(req.params.chattingRoomId);
            const { title, scheduled_at, place } = req.body;
            const senderId = req.user.service_id;

            if (!chattingRoomId) {
                throw new BadRequestError('chattingRoomId가 유효하지 않습니다.')
            }
            const result = await coffeechatService.requestCoffeechat({
                chattingRoomId, senderId, title, scheduled_at, place
            }
            )

            res.success({
                code: 200,
                message: '커피챗 요청 성공',
                result,
            })
        } catch (error) {
            next(error)
        }
    },
    acceptCoffeechat: async (req, res, next) => {
        try {
            const { chattingRoomId } = req.params
            const senderId = req.user.service_id
            const { coffeechat_id } = req.body
            const result = await coffeechatService.acceptCoffeechat({
                chattingRoomId,
                senderId,
                coffeechat_id
            })

            res.success({
                code: 200,
                message: '커피챗 수락 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    rejectCoffeechat: async (req, res, next) => {
        try {
            const { chattingRoomId, } = req.params
            const senderId = req.user.service_id
            const { coffeechat_id } = req.body
            const result = await coffeechatService.rejectCoffeechat({
                chattingRoomId,
                senderId,
                coffeechat_id
            })

            res.success({
                code: 200,
                message: '커피챗 요청을 거절했습니다.',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    updateCoffeechat: async (req, res, next) => {
        try {
            const senderId = req.user.service_id
            const { chattingRoomId } = req.params
            const { title, scheduled_at, place, coffeechat_id } = req.body
            const result = await coffeechatService.updateCoffeechat({
                chattingRoomId,
                senderId,
                title,
                scheduled_at,
                place,
                coffeechat_id
            })

            res.success({
                code: 200,
                message: '커피챗 요청을 수정했습니다.',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    cancelCoffeechat: async (req, res, next) => {
        try {
            const { chattingRoomId } = req.params
            const serviceId = req.user.service_id
            const { coffeechat_id } = req.body
            const result = await coffeechatService.cancelCoffeechat({
                chattingRoomId,
                serviceId,
                coffeechat_id
            })

            res.success({
                code: 200,
                message: '커피챗 요청을 취소했습니다.',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    getUpcomingCoffeechats: async (req, res, next) => {
        try {
            const myServiceId = req.user.service_id
            const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null

            const result = await coffeechatService.getUpcomingCoffeechats(myServiceId, cursor);

            res.success({
                code: 200,
                message: '예정된 커피챗 목록 조회 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    getCoffeeChatArchive: async (req, res, next) => {
        try {
            const myServiceId = req.user.service_id
            const page = parseInt(req.query.page) || 1

            const result = await coffeechatService.getCoffeeChatArchive(myServiceId, page)

            res.success({
                code: 200,
                message: '커피챗 보관함 조회 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    },
    getCoffeeChatDetail: async (req, res, next) => {
        try {
            const { chattingRoomId, coffeechatId } = req.params
            const myServiceId = req.user.service_id

            if (!chattingRoomId || !coffeechatId) {
                throw new BadRequestError('채팅방 ID 혹은 커피챗 ID가 누락되었습니다.')
            }

            const result = await coffeechatService.getCoffeeChatDetail({ chattingRoomId, coffeechatId, myServiceId })

            res.success({
                code: 200,
                message: '커피챗 상세 조회 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    }
}