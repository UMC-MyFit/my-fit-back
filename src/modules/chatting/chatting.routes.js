import express from 'express'
import chattingController from './chatting.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
import { validateChattingRoomParticipant } from '../../middlewares/validateParticipant.js'
const router = express.Router()

/**
 * @swagger
 * /api/chatting-rooms:
 *   get:
 *     summary: 채팅방 목록 조회
 *     description: 로그인한 사용자의 채팅방 목록을 조회합니다.
 *     tags:
 *       - Chatting
 *     responses:
 *       200:
 *         description: 채팅 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 채팅 목록 조회 성공
 *               result:
 *                 chatting_rooms:
 *                   - chatting_room_id: 11
 *                     partner:
 *                       service_id: 8
 *                       name: 김마핏
 *                       age: 25
 *                       low_sector: UI/UX 개발자
 *                       profile_image: ""
 *                       division: 'personal'
 *                     last_message:
 *                       message: 체크체크
 *                       sender_name: 김철수
 *                       type: TEXT
 *                       created_at: "2025-07-22T07:57:19.077Z"
 *                 next_cursor: null
 *       401:
 *         description: 인증 실패 (로그인 필요)
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 401
 *               message: 로그인이 필요한 요청입니다.
 *               result:
 *                 errorCode: A001
 *                 data:
 *                   message: 로그인이 필요한 요청입니다.
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버에 오류가 발생하였습니다.
 *               result:
 *                 errorCode: S001
 *                 data:
 *                   message: 서버에 오류가 발생하였습니다.
 */

// 채팅방 목록 조회
router.get('/', isAuthenticated, chattingController.getChattingRooms)

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
 *               service_id:
 *                 type: integer
 *             example:
 *               service_id: 9
 *     responses:
 *       200:
 *         description: 채팅방 확인 또는 생성 완료
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
 *                   example: 채팅방 확인 또는 생성 완료
 *                 result:
 *                   type: object
 *                   properties:
 *                     chatting_room_id:
 *                       type: integer
 *                       description: 채팅방 ID
 *                       example: 10
 *                     is_new:
 *                       type: boolean
 *                       description: 새로 생성된 채팅방 여부 (true는 새로 생성, false는 기존 존재)
 *                       example: false
 *             examples:
 *               existing_room:
 *                 summary: 기존 채팅방이 존재하는 경우
 *                 value:
 *                   isSuccess: true
 *                   code: 200
 *                   message: 채팅방 확인 또는 생성 완료
 *                   result:
 *                     chatting_room_id: 10
 *                     is_new: false
 *               new_room:
 *                 summary: 새로 생성된 채팅방인 경우
 *                 value:
 *                   isSuccess: true
 *                   code: 200
 *                   message: 채팅방 확인 또는 생성 완료
 *                   result:
 *                     chatting_room_id: 15
 *                     is_new: true
 */
// 채팅방 존재 여부 확인
router.post('/check-or-create', isAuthenticated, chattingController.checkOrCreateRoom)

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
 *               detail_message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, COFFEECHAT, SYSTEM]
 *             example:
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
    '/:chattingRoomId/messages', isAuthenticated, validateChattingRoomParticipant, chattingController.sendMessage
)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/messages:
 *   get:
 *     summary: 메시지 목록 조회
 *     description: 지정된 채팅방의 최근 20개 메시지를 조회 (cursor 방식 페이징)
 *     tags:
 *       - Chatting
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 이전 요청의 마지막 메시지 ID (페이징용)
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
 *                 chatting_room_id: 10
 *                 messages:
 *                   - id: 26
 *                     chat_id: 10
 *                     sender_id: 8
 *                     detail_message: 안녕하세요~
 *                     created_at: "2025-07-21T14:24:17.149Z"
 *                     type: TEXT
 *                   - id: 27
 *                     chat_id: 10
 *                     sender_id: 8
 *                     detail_message: 안녕하세요~
 *                     created_at: "2025-07-21T14:24:17.978Z"
 *                     type: TEXT
 *                 next_cursor: 21
 *                 has_next: true
 */
// 메시지 조회
router.get('/:chattingRoomId/messages', isAuthenticated, validateChattingRoomParticipant, chattingController.getMessages)

/**
 * @swagger
 * /api/chatting-rooms/{chattingRoomId}/partner:
 *   get:
 *     summary: 채팅방 상대방 프로필 정보 조회
 *     description: 지정된 채팅방에서 상대방의 서비스 정보를 조회합니다.
 *     tags:
 *       - Chatting
 *     parameters:
 *       - in: path
 *         name: chattingRoomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *     responses:
 *       200:
 *         description: 상대방 정보 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 상대방 정보 조회 성공
 *               result:
 *                 service_id: 3
 *                 name: 이미뇽
 *                 profile_img: "https://myfit-bucket-mhfd.s3.ap-northeast-2.amazonaws.com/recruit/보노보노.jpeg"
 *       400:
 *         description: 잘못된 요청 (존재하지 않는 채팅방 또는 상대방 없음)
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 400
 *               message: 상대방 정보를 찾을 수 없습니다.
 *               result: null
 *       401:
 *         description: 인증 실패 (로그인 필요)
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 401
 *               message: 로그인이 필요한 요청입니다.
 *               result:
 *                 errorCode: A001
 *                 data:
 *                   message: 로그인이 필요한 요청입니다.
 */

// 채팅방 입장
router.get('/:chattingRoomId/partner', isAuthenticated, validateChattingRoomParticipant, chattingController.getChatPartner)

export default router