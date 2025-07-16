import express from 'express';
import MypageController from './mypage.controller.js';

const router = express.Router();

/**
 * @swagger
 * /mypage/{user_id}/profile_info:
 *   get:
 *     summary: 사용자 프로필 정보 조회
 *     description: 특정 사용자의 공개 프로필 정보를 조회합니다.
 *     tags:
 *       - Mypage
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 # Prisma BigInt 타입에 맞춰 string으로 받음
 *         description: 프로필을 조회할 사용자의 고유 ID
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
 *         description: 잘못된 요청 (유효하지 않은 사용자 ID)
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
router.get('/:userId/profile_info', MypageController.getUserProfileInfo);

export default router;