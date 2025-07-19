import express from 'express'
import recruitmentController from './recruitments.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router()

//POST /api/recruiments : 리크루트 생성
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
 *               high_sector:
 *                 type: string
 *                 example: 개발 / 엔지니어링
 *               low_sector:
 *                 type: string
 *                 example: 프론트엔드 개발자
 *               area:
 *                 type: String
 *                 example: 서울특별시 강남구 테헤란로 311 (역삼역 도보 5분)
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

//GET /api/recruiments : 리크루트 전체 조회
/**
 * @swagger
 * /api/recruitments:
 *   get:
 *     summary: 채용공고 목록 조회
 *     description: 대분류/소분류 기반으로 채용공고 목록을 조회합니다.
 *     tags:
 *       - Recruitments
 *     parameters:
 *       - in: query
 *         name: highSector
 *         required: true
 *         schema:
 *           type: string
 *         description: 대분류 분야 (예- 개발)
 *         example: "개발 / 엔지니어링"
 *       - in: query
 *         name: lowSector
 *         required: false
 *         schema:
 *           type: string
 *         description: 소분류 분야 (예- 프론트엔드, 백엔드 등)
 *         example: "프론트엔드 개발자"
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 페이지네이션을 위한 커서 (채용공고 ID)
 *         example: 26
 *     responses:
 *       200:
 *         description: 채용공고 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recruitments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recruitment_id:
 *                         type: integer
 *                         description: 채용공고 ID
 *                         example: 26
 *                       title:
 *                         type: string
 *                         description: 채용공고 제목
 *                         example: "Next.js에 능한 성장형 프론트엔드 엔지니어"
 *                       require:
 *                         type: string
 *                         description: 채용 요구사항
 *                         example: "신입 및 경력 이상 (2023년 2월 졸업 예정)"
 *                       low_sector:
 *                         type: string
 *                         description: 소분류 분야
 *                         example: "프론트엔드"
 *                       work_type:
 *                         type: string
 *                         description: 근무형태
 *                         example: "정규직"
 *                       dead_line:
 *                         type: string
 *                         format: date
 *                         description: 마감일
 *                         example: "2025-07-10"
 *                       writer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 작성자 ID
 *                             example: 3
 *                           name:
 *                             type: string
 *                             description: 회사명
 *                             example: "위플핏"
 *                           profile_img:
 *                             type: string
 *                             description: 프로필 이미지 URL
 *                             example: "https://cdn.myfit.com/profile/3.jpg"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     next_cursor:
 *                       type: integer
 *                       description: 다음 페이지 커서
 *                       example: 25
 *                     has_next:
 *                       type: boolean
 *                       description: 다음 페이지 존재 여부
 *                       example: true
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 직무 분야)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효하지 않은 직무 분야입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버에 오류가 발생했습니다."
 */
router.get('/', recruitmentController.getAllRecruitment)


//GET /api/recruiments/:recruitmentId : 리크루트 전체 조회
/**
 * @swagger
 * /api/recruitments/{recruitmentId}:
 *   get:
 *     summary: 채용공고 상세 조회
 *     description: 특정 채용공고의 상세 정보를 조회합니다.
 *     tags:
 *       - Recruitments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채용공고 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 채용공고 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recruitment_id:
 *                   type: integer
 *                   description: 채용공고 ID
 *                   example: 26
 *                 title:
 *                   type: string
 *                   description: 채용공고 제목
 *                   example: "Next.js에 능한 성장형 프론트엔드 엔지니어"
 *                 low_sector:
 *                   type: string
 *                   description: 소분류 분야
 *                   example: "프론트엔드"
 *                 area:
 *                   type: string
 *                   description: 근무 지역
 *                   example: "서울특별시 강남구 대치동 311 (역삼역 도보 5분)"
 *                 require:
 *                   type: string
 *                   description: 채용 요구사항 및 우대사항
 *                   example: "경력 1년 이상 (신입도 병도 인원 전형 응용 예외)\n필수: Javascript, React, MySQL 활용능력"
 *                 salary:
 *                   type: string
 *                   description: 급여 정보
 *                   example: "연봉 3,300만원 ~ 6,000만원"
 *                 work_type:
 *                   type: string
 *                   description: 근무형태
 *                   example: "정규직 (수습 3개월, 급여 동일 지급)"
 *                 dead_line:
 *                   type: string
 *                   format: date
 *                   description: 마감일
 *                   example: "2025-01-01"
 *                 recruiting_img:
 *                   type: string
 *                   format: uri
 *                   description: 채용공고 이미지 URL
 *                   example: "https://cdn.myfit.com/recruit/26.jpg"
 *                 writer:
 *                   type: object
 *                   description: 채용공고 작성자(회사) 정보
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 회사 ID
 *                       example: 3
 *                     name:
 *                       type: string
 *                       description: 회사명
 *                       example: "위플핏"
 *                     profile_img:
 *                       type: string
 *                       format: uri
 *                       description: 회사 프로필 이미지 URL
 *                       example: "https://cdn.myfit.com/profile/3.jpg"
 *       404:
 *         description: 채용공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 공고가 존재하지 않습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류 발생"
 */
router.get('/:recruitmentId', recruitmentController.getOneRecruitment)

export default router
