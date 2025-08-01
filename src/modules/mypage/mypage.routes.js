import express from 'express'
import MypageController from './mypage.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/mypage/{service_id}/profile_info:
 *   get:
 *     summary: 사용자 프로필 정보 조회
 *     description: 특정 사용자의 공개 프로필 정보를 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 조회할 유저의 서비스 ID
 *     responses:
 *       200:
 *         description: 사용자 프로필 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 사용자 프로필 정보를 성공적으로 조회했습니다.
 *                 result:
 *                   type: object
 *                   properties:
 *                     userProfile:
 *                       type: object
 *                       description: 사용자 및 서비스 프로필 정보
 *                       properties:
 *                         service:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "123456789"
 *                             recruiting_status:
 *                               type: string
 *                               example: "구직 중"
 *                             profile_img:
 *                               type: string
 *                               example: "https://cdn.com/p.png"
 *                             high_sector:
 *                               type: string
 *                               example: "백엔드"
 *                             low_sector:
 *                               type: string
 *                               example: "Node.js"
 *                             userAreas:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   high_area:
 *                                     type: string
 *                                     example: "서울"
 *                                   low_area:
 *                                     type: string
 *                                     example: "강남구"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "11"
 *                             name:
 *                               type: string
 *                               example: "홍길동"
 *                             one_line_profile:
 *                               type: string
 *                               example: "열정 가득 백엔드"
 *                             Highest_grade:
 *                               type: string
 *                               example: "대학교 졸업"
 *                     interest_count:
 *                       type: integer
 *                       example: 3
 *                     network_count:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: "잘못된 요청 (유효하지 않은 사용자 ID)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 유효한 사용자 ID가 필요합니다.
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 사용자 프로필을 찾을 수 없습니다.
 *                 result:
 *                   type: object
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
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 프로필 정보를 가져오는 중 서버 오류가 발생했습니다.
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
 */
router.get('/:service_id/profile_info', MypageController.getUserProfileInfo)

// 사용자 프로필 사진 수정
/**
 * @swagger
 * /api/mypage/profile_pic:
 *   patch:
 *     summary: 사용자 프로필 사진 수정
 *     description: 특정 사용자의 프로필 사진 URL을 수정합니다.
 *     tags:
 *       - Mypage
 *     security:
 *       - bearerAuth: [] # JWT 또는 세션 기반 인증이 필요함을 나타냅니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_img
 *             properties:
 *               profile_img:
 *                 type: string
 *                 format: uri
 *                 description: 새로운 프로필 사진 URL
 *                 example: "https://example.com/new_profile_pic.png"
 *     responses:
 *       200:
 *         description: 프로필 사진이 성공적으로 수정되었습니다.
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
 *                   example: "프로필 사진이 성공적으로 수정되었습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: "2"
 *                     profile_img:
 *                       type: string
 *                       example: "https://example.com/new_profile_pic.png"
 *       400:
 *         description: "잘못된 요청 (유효하지 않은 프로필 사진 URL)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효한 프로필 사진 URL이 필요합니다."
 *       401:
 *         description: 인증되지 않은 요청 (로그인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: "권한 없음 (다른 사용자의 프로필 사진 수정 시도)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "다른 사용자의 프로필 사진을 수정할 권한이 없습니다."
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/profile_pic', isAuthenticated, MypageController.updateProfilePicture)

/**
 * @swagger
 * /api/mypage/recruiting_status/update:
 *   patch:
 *     summary: 유저의 현재 구인/구직 상태 업데이트
 *     description: 로그인된 사용자와 연결된 서비스의 recruiting_status 를 업데이트합니다.
 *     tags:
 *       - Mypage
 *     security:
 *       - cookieAuth: [] # 쿠키 기반 인증을 사용함을 나타냄
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recruiting_status, params]
 *             properties:
 *               recruiting_status:
 *                 type: string
 *                 example: "구직 중"
 *               params:
 *                 type: object
 *                 required: [service_id]
 *                 properties:
 *                   service_id:
 *                     type: string
 *                     example: "1234567890"
 *     responses:
 *       200:
 *         description: 유저의 현재 구인/구직 상태 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 유저의 현재 구인/구직 상태가 성공적으로 수정되었습니다.
 *                 result:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: string
 *                       example: "9876543210987654321"
 *                     recruiting_status:
 *                       type: string
 *                       example: "구직 중"
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 입력값 또는 상태 값)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효한 모집 상태 값이 필요합니다."
 *       401:
 *         description: 인증되지 않은 요청 (로그인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: 권한 없음 (다른 사용자의 현재 구인/구직 상태 수정 시도)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "권한이 없습니다. 자신의 현재 상태만 수정할 수 있습니다."
 *       404:
 *         description: 사용자를 찾을 수 없거나 연결된 서비스를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 사용자와 연결된 서비스를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/recruiting_status/update', isAuthenticated, MypageController.updateRecruitingStatus)

/**
 * @swagger
 * /api/mypage/{service_id}/feeds:
 *   get:
 *     summary: 특정 유저가 올린 피드 목록 조회 (마이페이지)
 *     description: 특정 서비스 ID를 가진 유저가 올린 피드 목록을 최신순으로 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 조회할 유저의 서비스 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: 한 페이지에 가져올 피드 개수
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: int64
 *           default: 0
 *           nullable: true
 *         description: 마지막 피드 ID (다음 페이지 커서용)
 *     responses:
 *       200:
 *         description: 피드 목록 조회 성공
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
 *                   example: 사용자 피드 목록을 성공적으로 조회했습니다.
 *                 result:
 *                   type: object
 *                   properties:
 *                     feeds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feed_id:
 *                             type: string
 *                             example: "123"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "456"
 *                               name:
 *                                 type: string
 *                                 example: "홍길동"
 *                               sector:
 *                                 type: string
 *                                 example: "백엔드"
 *                               profile_img:
 *                                 type: string
 *                                 example: "http://example.com/profile.jpg"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uri
 *                           feed_text:
 *                             type: string
 *                           hashtags:
 *                             type: string
 *                             example: "Node.js,Express"
 *                           heart:
 *                             type: integer
 *                           is_liked:
 *                             type: boolean
 *                           comment_count:
 *                             type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         next_cursor:
 *                           type: string
 *                           nullable: true
 *                           example: "123456789"
 *                         has_next:
 *                           type: boolean
 *                           example: true
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/:service_id/feeds', isAuthenticated, MypageController.getUserFeeds)

/**
 * @swagger
 * /api/mypage/{service_id}/cards:
 *   get:
 *     summary: 특정 유저가 올린 이력/활동 카드 목록 조회 (마이페이지)
 *     description: 특정 서비스 ID를 가진 유저가 올린 이력/활동 카드를 최신순으로 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 조회할 유저의 서비스 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: 한 페이지에 가져올 카드 수
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: int64
 *           default: 0
 *           nullable: true
 *         description: 마지막 카드 ID (다음 페이지 커서용)
 *     responses:
 *       200:
 *         description: 카드 목록 조회 성공
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
 *                   example: 사용자 이력/활동 카드 목록을 성공적으로 조회했습니다.
 *                 result:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "789"
 *                           card_img:
 *                             type: string
 *                             example: "https://cdn.example.com/cards/card01.jpg"
 *                           one_line_profile:
 *                             type: string
 *                             example: "사이드 프로젝트 매니아"
 *                           detailed_profile:
 *                             type: string
 *                           link:
 *                             type: string
 *                             nullable: true
 *                             example: "https://github.com/username"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           keywords:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Node.js", "React"]
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         next_cursor:
 *                           type: string
 *                           nullable: true
 *                           example: "456789123"
 *                         has_next:
 *                           type: boolean
 *                           example: false
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/:service_id/cards', isAuthenticated, MypageController.getUserCards)

export default router