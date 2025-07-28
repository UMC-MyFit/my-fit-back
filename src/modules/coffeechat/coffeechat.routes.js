import express from 'express'
import { coffeechatController } from './coffeechat.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router()

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/preview:
 *   get:
 *     summary: 커피챗 요청 미리보기 정보 조회
 *     description: 채팅방 ID를 기반으로 참여자 두 명의 프로필 정보를 반환합니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 커피챗 요청 미리보기 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 커피챗 요청 미리보기 조회 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_id:
 *                             type: integer
 *                             example: 9
 *                           name:
 *                             type: string
 *                             example: 박마핏
 *                           profile_img:
 *                             type: string
 *                             example: ""
 *       400:
 *         description: 잘못된 요청 (존재하지 않는 채팅방 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 잘못된 요청입니다. 입력값을 확인해주세요.
 *                 result:
 *                   type: object
 *                   properties:
 *                     errorCode:
 *                       type: string
 *                       example: C001
 *                     data:
 *                       type: string
 *                       example: 존재하지 않는 채팅방입니다.
 */

// 커피챗 요청 미리보기 정보 조회
router.get('/:chattingRoomId/coffeechats/preview', isAuthenticated, coffeechatController.getCoffeeChatPreview)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats:
 *   post:
 *     summary: 커피챗 요청
 *     description: 해당 채팅방에서 커피챗을 요청합니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - title
 *               - scheduled_at
 *               - place
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 description: 수신자 서비스 ID
 *                 example: 7
 *               title:
 *                 type: string
 *                 description: 커피챗 제목
 *                 example: 커리어 이야기 나눠요!
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *                 description: 약속 시간 (ISO 8601)
 *                 example: "2025-08-01T15:00:00.000Z"
 *               place:
 *                 type: string
 *                 description: 약속 장소
 *                 example: 스타벅스 강남점
 *     responses:
 *       200:
 *         description: 커피챗 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 커피챗 요청 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     chatting_room_id:
 *                       type: integer
 *                       example: 42
 *                     coffeechat_id:
 *                       type: integer
 *                       example: 9
 *                     sender_id:
 *                       type: integer
 *                       example: 3
 *                     receiver_id:
 *                       type: integer
 *                       example: 7
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-05T14:50:00.000Z"
 *       401:
 *         description: 로그인하지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 로그인이 필요한 요청입니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: 채팅방이 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 채팅방이 존재하지 않습니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 서버에 오류가 발생하였습니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */

// 커피챗 요청
router.post('/:chattingRoomId/coffeechats', isAuthenticated, coffeechatController.requestCoffeechat)

export default router