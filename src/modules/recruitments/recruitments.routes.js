import express from 'express'
import recruitmentController from './recruitments.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router()

/**
 * @swagger
 * /api/recruitments:
 *   post:
 *     tags:
 *       - Recruitments
 *     summary: 구인 공고 등록
 *     description: 구인 공고를 등록하는 API입니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: 프론트엔드 신입 개발자 모집
 *               job:
 *                 type: string
 *                 example: 프론트엔드 개발자
 *               high_area_id:
 *                 type: integer
 *                 example: 1
 *               low_area_id:
 *                 type: integer
 *                 example: 101
 *               require:
 *                 type: string
 *                 example: 4년제 졸업 이상(2026년 2월 졸업 예정)
 *               salary:
 *                 type: string
 *                 example: 300만원 ~ 400만원
 *               work_type:
 *                 type: string
 *                 example: 정규직
 *               dead_line:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-30
 *               recruiting_img:
 *                 type: string
 *                 example: https://cdn.myfit.com/recruiting/notice_101.jpg
 *     responses:
 *       201:
 *         description: 구인 공고 등록 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 201
 *               message: 구인 공고 등록 성공
 *               result:
 *                 recruiting_id: 7
 *                 title: 프론트엔드 신입 개발자 모집
 *                 service_id: 22
 *       401:
 *         description: 로그인이 필요한 요청
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 401
 *               message: 로그인이 필요한 요청입니다.
 *               result:
 *                 errorCode: A001
 *                 data:
 *                   message: 로그인이 필요한 요청입니다.
 *       404:
 *         description: 존재하지 않는 사용자 또는 지역 코드
 *         content:
 *           application/json:
 *             examples:
 *               notFoundUser:
 *                 summary: 존재하지 않는 사용자
 *                 value:
 *                   isSuccess: false
 *                   code: 404
 *                   message: 요청한 리소스를 찾을 수 없습니다.
 *                   result:
 *                     errorCode: C002
 *                     data:
 *                       message: 존재하지 않는 사용자입니다.
 *               notFoundRegion:
 *                 summary: 존재하지 않는 지역 코드
 *                 value:
 *                   isSuccess: false
 *                   code: 404
 *                   message: 요청한 리소스를 찾을 수 없습니다.
 *                   result:
 *                     errorCode: C002
 *                     data:
 *                       message: 존재하지 않는 상위/하위 지역입니다.
 *       500:
 *         description: 서버에 오류가 발생하였습니다.
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버에 오류가 발생하였습니다.
 *               result:
 *                 errorCode: S001
 *                 data:
 *                   message: 서버에 오류가 발생하였습니다.
 */

router.post('/', isAuthenticated, recruitmentController.createRecruitment)

export default router
