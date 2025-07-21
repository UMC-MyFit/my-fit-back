import express from 'express'
import chattingController from './chatting.controller.js'

const router = express.Router()

/**
 * @swagger
 * /api/chatting-rooms/check-or-create:
 *   post:
 *     summary: 채팅방 존재 확인 또는 생성
 *     description: 나와 상대방 사이의 채팅방이 존재하는지 확인하고, 없으면 새로 생성함
 *     tags:
 *       - Chatting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               my_service_id:
 *                 type: integer
 *               service_id:
 *                 type: integer
 *             example:
 *               my_service_id: 8
 *               service_id: 9
 *     responses:
 *       200:
 *         description: 채팅방 확인 또는 생성 완료
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 채팅방 확인 또는 생성 완료
 *               result:
 *                 chatting_room_id: 10
 */
// 채팅방 존재 여부 확인
router.post('/check-or-create', chattingController.checkOrCreateRoom)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/messages:
 *   post:
 *     summary: 메시지 전송
 *     description: 지정된 채팅방에 메시지를 전송
 *     tags:
 *       - Chatting
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: integer
 *               detail_message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, FILE]
 *             example:
 *               senderId: 8
 *               detail_message: 안녕하세요~
 *               type: TEXT
 *     responses:
 *       200:
 *         description: 메시지 전송 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 메시지 전송 성공
 *               result:
 *                 id: 27
 *                 chat_id: 10
 *                 sender_id: 8
 *                 detail_message: 안녕하세요~
 *                 created_at: "2025-07-21T14:24:17.978Z"
 *                 type: TEXT
 */
// 메시지 전송
router.post(
    '/:chattingRoomId/messages', chattingController.sendMessage
)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/messages:
 *   get:
 *     summary: 메시지 목록 조회
 *     description: 지정된 채팅방의 최근 20개 메시지를 조회
 *     tags:
 *       - Chatting
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 메시지 조회 성공
 *               result:
 *                 - id: 26
 *                   chat_id: 10
 *                   sender_id: 8
 *                   detail_message: 안녕하세요~
 *                   created_at: "2025-07-21T14:24:17.149Z"
 *                   type: TEXT
 *                 - id: 27
 *                   chat_id: 10
 *                   sender_id: 8
 *                   detail_message: 안녕하세요~
 *                   created_at: "2025-07-21T14:24:17.978Z"
 *                   type: TEXT
 */
// 메시지 조회
router.get('/:chattingRoomId/messages', chattingController.getMessages)

export default router