import express from 'express'
import chattingController from './chatting.controller.js'

const router = express.Router()

// 채팅방 존재 여부 확인
router.post('/check-or-create', chattingController.checkOrCreateRoom)

// 메시지 전송
router.post(
    '/:chattingRoomId/messages', chattingController.sendMessage
)

export default router