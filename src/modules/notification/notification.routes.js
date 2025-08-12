import NotificationController from './notification.controller.js'
import express from 'express'
import { isAuthenticated } from '../../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     description: 로그인한 사용자의 알림 20개를 커서 기반 페이지네이션 방식으로 조회합니다.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *         description: 이전에 조회한 마지막 알림의 ID (커서 페이지네이션용)
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
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
 *                   example: 알림 목록 조회 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           notification_id:
 *                             type: integer
 *                             example: 3
 *                           receiver_id:
 *                             type: integer
 *                             example: 50
 *                           sender_id:
 *                             type: integer
 *                             example: 52
 *                           type:
 *                             type: string
 *                             enum: [NETWORK, FEED]
 *                             example: FEED
 *                           feed_id:
 *                             type: integer
 *                             nullable: true
 *                             example: 70
 *                           message:
 *                             type: string
 *                             example: 김철수님이 회원님의 게시글에 댓글을 남겼어요
 *                           is_read:
 *                             type: boolean
 *                             example: false
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-11T13:07:41.969Z"
 *                           read_at:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *                           sender:
 *                             type: object
 *                             properties:
 *                               service_id:
 *                                 type: integer
 *                                 example: 52
 *                               name:
 *                                 type: string
 *                                 example: 김철수
 *                               profile_img:
 *                                 type: string
 *                                 format: uri
 *                                 example: https://myfit-bucket-mhfd.s3.ap-northeast-2.amazonaws.com/userProfile/base_profile2.svg
 *                     next_cursor:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     has_next:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버에 오류가 발생하였습니다.
 */

// 알림 목록 조회
router.get('/', isAuthenticated, NotificationController.getNotifications)

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: 미확인 알림 존재 여부 조회
 *     description: 현재 로그인한 사용자의 안 읽은(미확인) 알림이 있는지와 개수를 반환합니다.
 *     tags:
 *       - Notifications
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 미확인 알림 존재 여부 조회 성공
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
 *                   example: 미확인 알림 존재 여부 조회 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     has_unread:
 *                       type: boolean
 *                       example: true
 *                     unread_count:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버에 오류가 발생하였습니다.
 */

// 미확인 알림 조회
router.get('/unread', isAuthenticated, NotificationController.getUnreadSummary)

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: 알림 전체 읽음 처리
 *     description: 로그인한 사용자의 모든 읽지 않은 알림을 읽음 처리합니다.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 알림 전체 읽음 처리 성공
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
 *                   example: 알림 전체 읽음 처리 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     updated_count:
 *                       type: integer
 *                       example: 3
 *                     has_unread:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버에 오류가 발생하였습니다.
 */

// 알림 전체 읽음 처리
router.patch('/read-all', isAuthenticated, NotificationController.readAll)
export default router