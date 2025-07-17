import express from 'express'
import userController from './signUp.controller.js'
const router = express.Router()
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *         - SignUp
 *     summary: 회원가입
 *     description: 회원 정보를 입력하여 회원가입을 진행합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - division
 *               - one_line_profile
 *               - birth_date
 *               - high_area_id
 *               - low_area_id
 *               - recruiting_status
 *               - sector
 *               - grade_status
 *             properties:
 *               email:
 *                 type: string
 *                 example: chulsoo@naver.com
 *               password:
 *                 type: string
 *                 example: 1234
 *               division:
 *                 type: string
 *                 enum: [personal, team]
 *                 example: personal
 *               name:
 *                 type: string
 *                 example: 김철수
 *               one_line_profile:
 *                 type: string
 *                 example: 도전을 즐기는 프론트엔드 개발자
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: 1995-10-08
 *               high_area_id:
 *                 type: integer
 *                 example: 1
 *               low_area_id:
 *                 type: integer
 *                 example: 101
 *               recruiting_status:
 *                 type: string
 *                 example: 이직 준비 중
 *               sector:
 *                 type: string
 *                 example: 프론트엔드 개발
 *               grade_status:
 *                 type: string
 *                 example: 재학
 *     responses:
 *       201:
 *         description: 회원가입 성공
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: 회원가입 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 10
 *                     service_id:
 *                       type: integer
 *                       example: 10
 *                     email:
 *                       type: string
 *                       example: chulsoo@naver.com
 */

// 회원가입
router.post('/', userController.signup)

/**
 * @swagger
 * /api/users/send-auth-code:
 *   post:
 *     summary: 이메일 인증 코드 전송
 *     description: 입력한 이메일로 6자리 인증 코드를 전송합니다. (진짜로 가니까 자신의 이메일을 넣어주세요) 하루에 500개 제한이니까 너무 많이 호출하지 말아주세요 ㅠㅠ Redis는 로컬로 사용 중이어서 정상 작동하려면 Redis 설정 필요
 *     tags:
 *       - SignUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@naver.com
 *     responses:
 *       200:
 *         description: 인증코드 전송 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 인증코드 전송 완료
 *               result:
 *                 authCode: "324106"
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버 오류 발생
 *               result: null
 */

// 이메일 인증 코드 전송
router.post('/send-auth-code', userController.sendAuthCode)

export default router
