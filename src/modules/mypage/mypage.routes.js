import express from 'express';
import MypageController from './mypage.controller.js';
import { isAuthenticated } from '../../middlewares/auth.js';

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
router.get('/:userId/profile_info', MypageController.getUserProfileInfo);

// 사용자 프로필 사진 수정
/**
 * @swagger
 * /api/mypage/{userId}/profile_pic:
 *   patch:
 *     summary: 사용자 프로필 사진 수정
 *     description: 특정 사용자의 프로필 사진 URL을 수정합니다.
 *     tags:
 *       - Mypage
 *     security:
 *       - bearerAuth: [] # JWT 또는 세션 기반 인증이 필요함을 나타냅니다.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: 프로필 사진을 수정할 사용자의 ID
 *         example: 2
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
router.patch('/:userId/profile_pic', isAuthenticated, MypageController.updateProfilePicture);

/**
 * @swagger
 * /api/mypage/{target_service_id}/interests:
 *   patch:
 *     summary: 관심 요청/해제 (토글)
 *     description: "로그인된 사용자가 다른 서비스에 관심을 표현하거나 취소합니다. 자기 자신에게는 신청할 수 없으며, 차단했거나 차단당한 사용자에게는 신청할 수 없습니다. (유튜브 구독과 같은 단방향 관계)"
 *     tags:
 *       - Mypage
 *       - Interest
 *     parameters:
 *       - in: path
 *         name: target_service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 # BigInt 타입에 맞춰 string으로 받음
 *         description: 관심을 주고받을 상대방의 서비스 고유 ID
 *     security:
 *       - cookieAuth: [] # 쿠키 기반 인증을 사용함을 나타냄
 *     responses:
 *       200:
 *         description: 관심 요청 또는 해제 성공
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
 *               examples:
 *                 interestCreated:
 *                   summary: 관심 요청 생성
 *                   value: { isSuccess: true, code: 200, message: "관심이 성공적으로 추가되었습니다." }
 *                 interestDeleted:
 *                   summary: 관심 요청 해제
 *                   value: { isSuccess: true, code: 200, message: "관심이 성공적으로 해제되었습니다." }
 *       400:
 *         description: "잘못된 요청 (유효하지 않은 ID 또는 자기 자신에게 신청)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효한 상대방 서비스 ID가 필요합니다."
 *       401:
 *         description: 인증되지 않은 요청 (로그인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: "금지된 요청 (차단 관계)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *             examples:
 *               message:
 *                 value: "차단한 사용자에게는 관심 요청을 할 수 없습니다."
 *       404:
 *         description: 상대방 서비스를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             examples:
 *               message:
 *                 value: "상대방 서비스를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/:target_service_id/interests', isAuthenticated, MypageController.toggleInterest);

export default router;