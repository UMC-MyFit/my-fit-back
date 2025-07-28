import express from 'express'
import { coffeechatController } from './coffeechat.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
import { validateChattingRoomParticipant } from '../../middlewares/validateParticipant.js'
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
router.get('/:chattingRoomId/coffeechats/preview', isAuthenticated, validateChattingRoomParticipant, coffeechatController.getCoffeeChatPreview)

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
router.post('/:chattingRoomId/coffeechats', isAuthenticated, validateChattingRoomParticipant, coffeechatController.requestCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/{coffeechatId}/accept:
 *   patch:
 *     summary: 커피챗 요청 수락
 *     description: 커피챗 요청을 수락하고 메시지를 전송합니다. PENDING 상태일 때만 수락할 수 있습니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: coffeechatId
 *         required: true
 *         description: 커피챗 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 커피챗 수락 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: 커피챗 요청을 수락했습니다.
 *                 result:
 *                   coffeechat_id: 9
 *                   chatting_room_id: 42
 *                   sender_id: 3
 *                   receiver_id: 7
 *                   created_at: "2025-07-28T10:30:00.000Z"
 *       400:
 *         description: 이미 처리된 커피챗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 400
 *                 message: 이미 처리된 커피챗입니다.
 *                 result: null
 *       401:
 *         description: 로그인되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 401
 *                 message: 로그인이 필요한 요청입니다.
 *                 result: null
 *       404:
 *         description: 커피챗을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 404
 *                 message: 해당 커피챗을 찾을 수 없습니다.
 *                 result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: 서버에 오류가 발생하였습니다.
 *                 result: null
 */

// 커피챗 수락
router.patch('/:chattingRoomId/coffeechats/:coffeechatId/accept', isAuthenticated, validateChattingRoomParticipant, coffeechatController.acceptCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/{coffeechatId}/reject:
 *   patch:
 *     summary: 커피챗 요청 거절
 *     description: 커피챗 요청을 거절하고 SYSTEM 메시지를 전송합니다. PENDING 상태일 때만 거절할 수 있습니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: coffeechatId
 *         required: true
 *         description: 커피챗 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 커피챗 거절 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: 커피챗 요청을 거절했습니다.
 *                 result:
 *                   coffeechat_id: 9
 *                   status: REJECTED
 *       400:
 *         description: 이미 처리된 커피챗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 400
 *                 message: 이미 처리된 커피챗입니다.
 *                 result: null
 *       401:
 *         description: 로그인되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 401
 *                 message: 로그인이 필요한 요청입니다.
 *                 result: null
 *       403:
 *         description: 요청자가 해당 커피챗의 수락/거절 권한이 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 403
 *                 message: 해당 커피챗 요청의 수락자가 아닙니다.
 *                 result: null
 *       404:
 *         description: 커피챗을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 404
 *                 message: 존재하지 않는 커피챗 요청입니다.
 *                 result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: 서버에 오류가 발생하였습니다.
 *                 result: null
 */

// 커피챗 거절
router.patch('/:chattingRoomId/coffeechats/:coffeechatId/reject', isAuthenticated, validateChattingRoomParticipant, coffeechatController.rejectCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/{coffeechatId}/update:
 *   patch:
 *     summary: 커피챗 요청 수정
 *     description: 커피챗 요청자만 커피챗의 제목, 시간, 장소를 수정할 수 있습니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: coffeechatId
 *         required: true
 *         description: 커피챗 ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: 만나서 이야기 나눠보고 싶어요!
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-21T15:30:00.000Z"
 *               place:
 *                 type: string
 *                 example: 서울시 용산구 마핏카페
 *     responses:
 *       200:
 *         description: 커피챗 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: 커피챗 요청을 수정했습니다.
 *                 result:
 *                   coffeechat_id: 9
 *                   title: 만나서 이야기 나눠보고 싶어요!
 *                   scheduled_at: "2025-05-21T15:30:00.000Z"
 *                   place: 서울시 용산구 마핏카페
 *       401:
 *         description: 로그인되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 401
 *                 message: 로그인이 필요한 요청입니다.
 *                 result: null
 *       403:
 *         description: 요청자가 아님
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 403
 *                 message: 커피챗 요청자만 수정할 수 있습니다.
 *                 result: null
 *       404:
 *         description: 커피챗을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 404
 *                 message: 해당 커피챗을 찾을 수 없습니다.
 *                 result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: 서버에 오류가 발생하였습니다.
 *                 result: null
 */

// 커피챗 수정
router.patch('/:chattingRoomId/coffeechats/:coffeechatId/update', isAuthenticated, validateChattingRoomParticipant, coffeechatController.updateCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/{coffeechatId}/cancel:
 *   patch:
 *     summary: 커피챗 요청 취소
 *     description: 커피챗 요청자 또는 수신자만 커피챗 요청을 취소할 수 있습니다. 모든 상태에서 취소할 수 있습니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         description: 채팅방 ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: coffeechatId
 *         required: true
 *         description: 커피챗 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 커피챗 요청 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: 커피챗 요청을 취소했습니다.
 *                 result:
 *                   coffeechat_id: 9
 *                   status: CANCELED
 *       401:
 *         description: 로그인되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 401
 *                 message: 로그인이 필요한 요청입니다.
 *                 result: null
 *       403:
 *         description: 취소 권한 없음 (요청자 또는 수신자가 아님)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 403
 *                 message: 해당 커피챗 요청의 요청자 또는 수신자만 취소할 수 있습니다.
 *                 result: null
 *       404:
 *         description: 존재하지 않는 커피챗 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 404
 *                 message: 존재하지 않는 커피챗 요청입니다.
 *                 result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: 서버에 오류가 발생하였습니다.
 *                 result: null
 */

// 커피챗 취소
router.patch('/:chattingRoomId/coffeechats/:coffeechatId/cancel', isAuthenticated, coffeechatController.cancelCoffeechat)

export default router