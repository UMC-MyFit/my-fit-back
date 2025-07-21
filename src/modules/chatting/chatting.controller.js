import chattingService from './chatting.service.js'

const chattingController = {
    checkOrCreateRoom: async (req, res, next) => {
        try {
            //const myServiceId = req.user.service_id
            //const { service_id: target_service_id } = req.body
            const { my_service_id: myServiceId, service_id: target_service_id } = req.body
            console.log('🔥 myServiceId:', myServiceId)
            console.log('🔥 target_service_id:', target_service_id)
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
            const { senderId, content, type } = req.body

            const message = await chattingService.sendMessage({
                chattingRoomId,
                senderId,
                content,
                type,
            })

            res.success({
                code: 200,
                message: '메시지 전송 성공',
                result: message,
            })
        } catch (error) {
            next(error)
        }
    }
}

export default chattingController