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
 * /api/chatting-rooms/{chatting_room_id}/coffeechats/{coffeechat_id}:
 *   get:
 *     summary: 커피챗 상세 조회
 *     description: 커피챗 메시지를 클릭하면 해당 커피챗의 상세 정보를 반환합니다.
 *     tags:
 *       - CoffeeChat
 *     parameters:
 *       - in: path
 *         name: chatting_room_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 채팅방 ID
 *       - in: path
 *         name: coffeechat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 커피챗 ID
 *     responses:
 *       200:
 *         description: 커피챗 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coffeechat_id:
 *                   type: integer
 *                   example: 9
 *                 chatting_room_id:
 *                   type: integer
 *                   example: 42
 *                 sender:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: 장예슬
 *                     profile_image_url:
 *                       type: string
 *                       example: https://cdn.myfit.com/users/3.png
 *                 receiver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 7
 *                     name:
 *                       type: string
 *                       example: 임호현
 *                     profile_image_url:
 *                       type: string
 *                       example: https://cdn.myfit.com/users/7.png
 *                 title:
 *                   type: string
 *                   example: 만나서 얘기해보면 더 재밌을 것 같아요
 *                 place:
 *                   type: string
 *                   example: 서울시 용산구 마핏카페
 *                 scheduled_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-21T15:30:00.000Z
 *                 status:
 *                   type: string
 *                   enum: [PENDING, ACCEPTED, REJECTED, CANCELED]
 *                   example: ACCEPTED
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-05T14:50:00Z
 *                 accepted_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-06T14:20:00Z
 *       401:
 *         description: 로그인이 필요한 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그인이 필요한 요청입니다.
 *       403:
 *         description: 해당 커피챗에 접근할 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 해당 커피챗에 접근할 권한이 없습니다.
 *       404:
 *         description: 존재하지 않는 커피챗 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 커피챗 요청입니다.
 *       500:
 *         description: 서버에 오류가 발생하였습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버에 오류가 발생하였습니다.
 */

// 커피챗 상세 조회
router.get('/:chattingRoomId/coffeechats/:coffeechatId', isAuthenticated, validateChattingRoomParticipant, coffeechatController.getCoffeeChatDetail)
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
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/accept:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coffeechat_id
 *             properties:
 *               coffeechat_id:
 *                 type: integer
 *                 example: 123
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
router.patch('/:chattingRoomId/coffeechats/accept', isAuthenticated, validateChattingRoomParticipant, coffeechatController.acceptCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/reject:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coffeechat_id
 *             properties:
 *               coffeechat_id:
 *                 type: integer
 *                 example: 123
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
router.patch('/:chattingRoomId/coffeechats/reject', isAuthenticated, validateChattingRoomParticipant, coffeechatController.rejectCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/update:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coffeechat_id:
 *                 type: string
 *                 example: 123
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
router.patch('/:chattingRoomId/coffeechats/update', isAuthenticated, validateChattingRoomParticipant, coffeechatController.updateCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/coffeechats/cancel:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coffeechat_id
 *             properties:
 *               coffeechat_id:
 *                 type: integer
 *                 example: 123
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
router.patch('/:chattingRoomId/coffeechats/cancel', isAuthenticated, coffeechatController.cancelCoffeechat)

/**
 * @swagger
 * /api/chatting-rooms/coffeechats:
 *   get:
 *     summary: 예정된 커피챗 목록 조회
 *     tags: [CoffeeChat]
 *     description: 로그인된 사용자의 예정된 커피챗 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: 다음 페이지 조회를 위한 커서 (마지막 커피챗 ID)
 *     responses:
 *       200:
 *         description: 예정된 커피챗 목록 조회 성공
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
 *                   example: 예정된 커피챗 목록 조회 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     coffeechats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           coffeechat_id:
 *                             type: integer
 *                             example: 4
 *                           chatting_room_id:
 *                             type: integer
 *                             example: 4
 *                           opponent:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: 김김김
 *                               age:
 *                                 type: integer
 *                                 example: 30
 *                               job:
 *                                 type: string
 *                                 example: 프론트엔드 개발자
 *                               profile_image:
 *                                 type: string
 *                                 example: ""
 *                           scheduled_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-01T00:00:00.000Z"
 *                           place:
 *                             type: string
 *                             example: 서울시 용산구 마핏카페
 *                     next_cursor:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     has_next:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: 인증되지 않은 사용자
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
 *       500:
 *         description: 서버 내부 오류
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
 *                   example: 서버 내부 오류 발생
 */

// 예정된 커피챗 조회
router.get('/coffeechats', isAuthenticated, coffeechatController.getUpcomingCoffeechats)

/**
 * @swagger
 * /api/chatting-rooms/coffeechats/archive:
 *   get:
 *     summary: 커피챗 보관함 조회
 *     description: 과거에 진행된 커피챗을 페이지 단위로 조회합니다. (status가 ACCEPTED이고 scheduled_at이 과거인 커피챗만 포함)
 *     tags: [CoffeeChat]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: true
 *         description: 조회할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 커피챗 보관함 조회 성공
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
 *                   example: 커피챗 보관함 조회 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           coffeechat_id:
 *                             type: integer
 *                             example: 9
*                           chatting_room_id:
 *                             type: integer
 *                             example: 4
 *                           opponent:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: 이미뇽
 *                               age:
 *                                 type: integer
 *                                 example: 24
 *                               job:
 *                                 type: string
 *                                 example: 백엔드 개발자
 *                               profile_image:
 *                                 type: string
 *                                 format: uri
 *                                 example: https://myfit-bucket-mhfd.s3.ap-northeast-2.amazonaws.com/recruit/보노보노.jpeg
 *                           scheduled_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-07-30T00:00:00.000Z
 *                           place:
 *                             type: string
 *                             example: 공차 광운대점
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: 로그인되지 않은 유저의 요청
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
 *       500:
 *         description: 서버 내부 오류 발생
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
 *                   example: 서버 내부 오류 발생
 */

// 커피챗 보관함
router.get('/coffeechats/archive', isAuthenticated, coffeechatController.getCoffeeChatArchive)
export default router