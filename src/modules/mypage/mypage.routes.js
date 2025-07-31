import express from 'express'
import MypageController from './mypage.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/mypage/profile_info:
 *   get:
 *     summary: 사용자 프로필 정보 조회
 *     description: 특정 사용자의 공개 프로필 정보를 조회합니다.
 *     tags:
 *       - Mypage
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
 *                     id:
 *                       type: string
 *                       example: "123456789012345678"
 *                     name:
 *                       type: string
 *                       example: "김철수"
 *                     one_line_profile:
 *                       type: string
 *                       example: "열정적인 개발자입니다."
 *                     birth_date:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-01-01T00:00:00.000Z"
 *                     Highest_grade:
 *                       type: string
 *                       nullable: true
 *                       example: "대학교 졸업"
 *                     link:
 *                       type: string
 *                       nullable: true
 *                       example: "https://myportfolio.com"
 *                     division:
 *                       type: string
 *                       nullable: true
 *                       example: "개인"
 *                     grade_status:
 *                       type: string
 *                       nullable: true
 *                       example: "졸업"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     is_profile_completed:
 *                       type: boolean
 *                       example: true
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
router.get('/profile_info', isAuthenticated, MypageController.getUserProfileInfo)

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
 *             required:
 *               - recruiting_status
 *             properties:
 *               recruiting_status:
 *                 type: string
 *                 enum: ['현재 구직 중!', '현재 구인 중!', '구인 협의 중', '네트워킹 환영', '해당 없음']
 *                 example: "현재 구직 중!"
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
 *     description: 특정 Service ID를 가진 유저가 올린 피드 목록을 최신순으로 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 # BigInt 타입에 맞춰 string으로 받음
 *         description: 조회할 대상 유저의 서비스 고유 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           default: 10
 *         description: 한 페이지에 가져올 피드 수
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: int64 # BigInt 타입에 맞춰 string으로 받음
 *         description: 이전 페이지의 마지막 피드 ID (다음 페이지 조회를 위한 커서)
 *     security:
 *       - cookieAuth: [] # 쿠키 기반 인증을 사용함을 나타냄
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
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "사용자 피드 목록을 성공적으로 조회했습니다."
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
 *                             example: "1234567890123456789"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "9876543210987654321"
 *                               name:
 *                                 type: string
 *                                 example: "테스트서비스"
 *                               sector:
 *                                 type: string
 *                                 example: "IT"
 *                               profile_img:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "http://example.com/profile.png"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-26T14:30:00Z"
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uri
 *                               example: ["http://example.com/feed_img1.jpg", "http://example.com/feed_img2.jpg"]
 *                           feed_text:
 *                             type: string
 *                             example: "이것은 특정 유저의 피드 내용입니다."
 *                           hashtags:
 *                             type: string
 *                             example: "개발,백엔드,Node.js"
 *                           heart:
 *                             type: number
 *                             example: 5
 *                           comment_count:
 *                             type: number
 *                             example: 2
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *                         nextCursorId:
 *                           type: string
 *                           nullable: true
 *                           example: "1234567890123456780" # 다음 페이지 조회를 위한 커서
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
 *     description: 특정 Service ID를 가진 유저가 올린 이력/활동 카드 목록을 최신순으로 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 # BigInt 타입에 맞춰 string으로 받음
 *         description: 조회할 대상 유저의 서비스 고유 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           default: 10
 *         description: 한 페이지에 가져올 카드 수
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: int64 # BigInt 타입에 맞춰 string으로 받음
 *         description: 이전 페이지의 마지막 카드 ID (다음 페이지 조회를 위한 커서)
 *     security:
 *       - cookieAuth: [] # 쿠키 기반 인증을 사용함을 나타냄
 *     responses:
 *       200:
 *         description: 이력/활동 카드 목록 조회 성공
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
 *                   example: "사용자 이력/활동 카드 목록을 성공적으로 조회했습니다."
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
 *                             example: "1234567890123456789"
 *                           card_img:
 *                             type: string
 *                             example: "https://cdn.example.com/cards/card_img01.png"
 *                           one_line_profile:
 *                             type: string
 *                             example: "사이드 프로젝트 매니아"
 *                           detailed_profile:
 *                             type: string
 *                             example: "Vue, React 기반 프로젝트 경험 다수. UI/UX에 관심이 많습니다."
 *                           link:
 *                             type: string
 *                             nullable: true
 *                             example: "https://github.com/chulsoo123"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-26T14:00:00Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-26T14:00:00Z"
 *                           keywords:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Node.js", "Express", "Prisma"]
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *                         nextCursorId:
 *                           type: string
 *                           nullable: true
 *                           example: "1234567890123456780" # 다음 페이지 조회를 위한 커서
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/:service_id/cards', isAuthenticated, MypageController.getUserCards)

export default router