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
 *               message: 잘못된 요청입니다.
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

export default router
