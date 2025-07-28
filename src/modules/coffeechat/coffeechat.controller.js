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
            const { receiver_id, title, scheduled_at, place } = req.body;
            const senderId = req.user.service_id;
            if (!chattingRoomId) {
                throw new BadRequestError('chattingRoomId가 유효하지 않습니다.')
            }
            const result = await coffeechatService.requestCoffeechat({
                chattingRoomId, senderId, receiver_id, title, scheduled_at, place
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
    }
}