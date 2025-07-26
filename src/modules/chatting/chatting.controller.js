import chattingService from './chatting.service.js'
import { UnauthorizedError } from '../../middlewares/error.js'
const chattingController = {
    checkOrCreateRoom: async (req, res, next) => {
        try {
            const myServiceId = req.user.service_id
            const { service_id: target_service_id } = req.body
            const roomId = await chattingService.checkOrCreateRoom(
                myServiceId,
                target_service_id
            )

            res.success({
                code: 200,
                message: '채팅방 확인 또는 생성 완료',
                result: { chatting_room_id: roomId }
            })
        } catch (error) {
            next(error)
        }
    },
    sendMessage: async (req, res, next) => {
        try {
            const { chattingRoomId } = req.params
            const senderId = req.user.service_id
            const { detail_message, type } = req.body
            console.log(chattingRoomId)
            const message = await chattingService.sendMessage({
                chattingRoomId,
                senderId,
                detail_message,
                type

            })

            res.success({
                code: 200,
                message: '메시지 전송 성공',
                result: message,
            })
        } catch (error) {
            next(error)
        }
    },
    getMessages: async (req, res, next) => {
        try {
            const { chattingRoomId } = req.params
            const offset = parseInt(req.query.offset) || 0

            const messages = await chattingService.getMessages(chattingRoomId, offset)
            res.success({
                code: 200,
                message: '메시지 조회 성공',
                result: messages,
            })
        } catch (error) {
            next(error)
        }
    },
    getChattingRooms: async (req, res, next) => {
        try {
            const myServiceId = req.user.service_id
            if (!myServiceId) {
                throw new UnauthorizedError()
            }
            const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null
            const result = await chattingService.getChattingRooms(myServiceId, cursor)
            res.success({
                code: 200,
                message: '채팅 목록 조회 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default chattingController