import express from 'express'
import SettingController from './setting.controller.js'
import { isAuthenticated } from '../../../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     summary: 프로필 정보 조회
 *     description: 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 *     tags:
 *       - Settings
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 프로필 정보 조회 성공
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
 *                   example: 프로필 정보를 성공적으로 조회했습니다.
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
 *                       nullable: true
 *                       example: "열정적인 개발자입니다."
 *                     birth_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "1990-01-01T00:00:00.000Z"
 *                     Highest_grade:
 *                       type: string
 *                       nullable: true
 *                       example: "대학교 졸업"
 *                     grade_status:
 *                       type: string
 *                       nullable: true
 *                       example: "졸업"
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                       example: "010-1234-5678"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: 인증되지 않은 요청 (로그인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
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
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.get('/profile', isAuthenticated, SettingController.getProfile)

/**
 * @swagger
 * /api/settings/profile:
 *   patch:
 *     summary: 프로필 수정
 *     description: 현재 로그인된 사용자의 프로필 정보를 수정합니다.
 *     tags:
 *       - Settings
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *                 example: "김철수"
 *               one_line_profile:
 *                 type: string
 *                 nullable: true
 *                 description: 한줄 소개
 *                 example: "열정적인 풀스택 개발자입니다."
 *               birth_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: 생년월일
 *                 example: "1995-10-08T00:00:00.000Z"
 *               Highest_grade:
 *                 type: string
 *                 nullable: true
 *                 description: 최종 학력
 *                 example: "대학교 졸업"
 *               grade_status:
 *                 type: string
 *                 nullable: true
 *                 description: 학적 상태
 *                 example: "졸업"
 *               high_area:
 *                 type: string
 *                 nullable: true
 *                 description: 상위 지역
 *                 example: "서울"
 *               low_area:
 *                type: string
 *                nullable: true
 *                description: 하위 지역
 *                example: "강남구"
 *               recruiting_status:
 *                type: string
 *                description: 모집 상태
 *                example: "모집 중"
 *               low_sector:
 *                type: string
 *                nullable: true
 *                description: 희망 직군
 *                example: "백엔드 개발"
 * 
 *     responses:
 *       200:
 *         description: 프로필이 성공적으로 수정되었습니다.
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
 *                   example: "프로필이 성공적으로 수정되었습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123456789012345678"
 *                     name:
 *                       type: string
 *                       example: "김철수"
 *                     profile_img:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/new-profile.jpg"
 *                     one_line_profile:
 *                       type: string
 *                       nullable: true
 *                       example: "열정적인 풀스택 개발자입니다."
 *                     birth_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "1990-01-01T00:00:00.000Z"
 *                     Highest_grade:
 *                       type: string
 *                       nullable: true
 *                       example: "대학교 졸업"
 *                     link:
 *                       type: string
 *                       nullable: true
 *                       example: "https://github.com/kimchulsu"
 *                     division:
 *                       type: string
 *                       nullable: true
 *                       example: "개인"
 *                     grade_status:
 *                       type: string
 *                       nullable: true
 *                       example: "졸업"
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                       example: "010-1234-5678"
 *                     notification_enabled:
 *                       type: boolean
 *                       example: true
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: "잘못된 요청 (유효하지 않은 입력값)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효하지 않은 프로필 정보입니다."
 *       401:
 *         description: 인증되지 않은 요청 (로그인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
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
 *       422:
 *         description: 유효성 검사 실패
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
 *                   example: 422
 *                 message:
 *                   type: string
 *                   example: "입력값 유효성 검사에 실패했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: "email"
 *                           message:
 *                             type: string
 *                             example: "유효한 이메일 형식이 아닙니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/profile', isAuthenticated, SettingController.updateProfile)

export default router