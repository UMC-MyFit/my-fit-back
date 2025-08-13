import express from 'express'
import usersController from './user.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router()

/**
 * @swagger
 * /api/users/business-license:
 *   patch:
 *     tags:
 *       - Users
 *     summary: 기업 회원 사업자 등록증 등록/수정
 *     description: 기업 회원이 사업자 등록증을 등록하거나 수정합니다. 기업 회원만 가능 (원래 service_id body에 안들어감. 로그인 기능 구현 전까지 임시로 body에 넣음)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               inc_AuthN_file:
 *                 type: string
 *                 description: 사업자 등록증 이미지 URL
 *                 example:
 *                  https://cdn.example.com/uploads/license123.png
 *     responses:
 *       200:
 *         description: 사업자 등록증 등록 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 사업자 등록증 등록/수정 성공
 *               result:
 *                 service_id: 11
 *                 inc_AuthN_file: https://cdn.example.com/uploads/license123.png
 *       400:
 *         description: 기업 회원이 아닌 경우
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 400
 *               message: 잘못된 요청입니다..
 *               result:
 *                 errorCode: "U003"
 *                 data:
 *                   message: 사업자 등록증은 기업 회원만 등록할 수 있습니다.
 *       404:
 *         description: 유저 또는 서비스 정보 없음
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 404
 *               message: 요청한 리소스를 찾을 수 없습니다.
 *               result:
 *                 errorCode: "U001"
 *                 data:
 *                   message: 유저를 찾을 수 없습니다.
 */

router.patch(
    '/business-license',
    isAuthenticated,
    usersController.updateBusinessLicense
)

/**
 * @swagger
 * /api/users/password-reset:
 *   patch:
 *     tags:
 *       - Users
 *     summary: 비밀번호 재설정
 *     description: 인증번호를 기반으로 비밀번호를 재설정합니다. (아직 로컬 Redis여서 정상작동하려면 로컬 Redis 설정 필요)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - authCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               authCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newStrongPassword123!
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공
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
 *                   example: 비밀번호가 성공적으로 변경되었습니다.
 *                 result:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: 인증코드 불일치 또는 비밀번호 조건 미달
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
 *                   example: 인증코드가 유효하지 않습니다.
 *                 result:
 *                   type: "null"
 *                   example: null
 *       404:
 *         description: 이메일이 가입되지 않은 경우
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
 *                   example: 가입되지 않은 이메일입니다.
 *                 result:
 *                   type: "null"
 *                   example: null
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
 *                   example: 서버 오류 발생
 *                 result:
 *                   type: "null"
 *                   example: null
 */

// 비밀번호 재설정
router.patch('/password-reset', usersController.resetPassword)

/**
 * @swagger
 * /api/users/verify-code:
 *   post:
 *     tags:
 *       - Users
 *     summary: 이메일 인증코드 검증
 *     description: 인증번호 입력창에 6자리를 입력할 때마다 호출되어 사용자가 입력한 인증번호가 맞는지 체크하는 API. (Redis 설정 필요)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - authCode
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               authCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 인증코드 일치
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
 *                   example: 인증코드가 유효합니다.
 *                 result:
 *                   type: "null"
 *       400:
 *         description: 인증코드 불일치 또는 만료
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
 *                   example: 인증코드가 유효하지 않습니다.
 *                 result:
 *                   type: "null"
 */

// 인증코드 유효성 검사
router.post('/verify-code', usersController.verifyCode)

/**
 * @swagger
 * /api/users/verify-user:
 *   post:
 *     summary: 이메일 및 비밀번호 유효성 검증
 *     tags:
 *       - Users
 *     description: 사용자가 입력한 이메일과 비밀번호의 유효성을 검증합니다. 이메일 형식이 유효하고, 비밀번호가 6자리 이상이며, 중복 이메일이 아닐 경우 성공합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               authCode:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: 유효한 이메일과 비밀번호
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
 *                   example: 아이디와 비밀번호가 유효합니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: 유효하지 않은 이메일 형식 또는 비밀번호
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
 *                   example: 비밀번호가 유효하지 않습니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       409:
 *         description: 이미 가입된 이메일
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
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: 이미 회원가입된 이메일입니다.
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
 *                   example: 서버에 문제가 발생하였습니다.
 *                 result:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */

// 이메일+비밀번호+인증번호 유효성 검사
router.post('/verify-user', usersController.verifyUser)

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 회원 탈퇴 시 해당 회원과 연관된 모든 데이터를 삭제합니다.
 *     tags:
 *       - Users
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 회원 탈퇴 및 연관 데이터 삭제 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: "회원 탈퇴 및 연관 데이터 삭제 완료"
 *                 result: null
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: "서버에 오류가 발생하였습니다."
 *                 result: null
 */

// 회원 탈퇴
router.delete('/', isAuthenticated, usersController.deleteUser)
export default router
