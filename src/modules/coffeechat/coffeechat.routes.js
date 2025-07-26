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

export default router