import express from 'express'
import recruitmentController from './recruitments.controller.js'
import subscriptionController from './subscription/subscription.controller.js'
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
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 대분류 분야 (예- 개발/엔지니어링)
 *                 example:
 *                   - 개발/엔지니어링
 *                   - 개발/엔지니어링
 *               low_sector:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 소분류 분야 (예- 프론트엔드 개발자, 백엔드 개발자 등)
 *                 example: 
 *                   - 프론트엔드 개발자
 *                   - 백엔드 개발자
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
 *         example: "개발/엔지니어링"
 *       - in: query
 *         name: lowSector
 *         required: false
 *         schema:
 *           type: string
 *         description: 소분류 분야 (예- 프론트엔드 개발자, 백엔드 개발자 등)
 *         example: "프론트엔드 개발자"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: 페이지네이션을 위한 offset 값
 *         example: 1
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
 *                         type: array
 *                         items:
 *                              type: string
 *                         description: 소분류 분야
 *                         example: ["프론트엔드 개발자", "백엔드 개발자"]
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
 *                     total_page:
 *                      type: integer
 *                      description: 전체 페이지 수
 *                      example: 5
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

// GET /api/recruitments/subscribe : 구독한 리크루팅 조회
/**
 * @swagger
 * /api/recruitments/subscribe:
 *   get:
 *     tags:
 *       - Recruitments
 *     summary: 구독한 채용 공고 목록 조회
 *     description: 구독된 채용 공고 목록을 페이징하여 조회합니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         example: 1
 *         description: 페이징을 위한 offset 값
 *     responses:
 *       200:
 *         description: 채용 공고 목록 조회 성공
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
 *                         description: 채용 공고 ID
 *                         example: 26
 *                       title:
 *                         type: string
 *                         description: 채용 공고 제목
 *                         example: "Next.js와 함께 성장할 프론트엔드 엔지니어"
 *                       low_sector:
 *                         type: array
 *                         items:  
 *                              type: string
 *                         description: 직무 분야
 *                         example: 
 *                              - "프론트엔드 개발자"
 *                              - "백엔드 개발자"
 *                       dead_line:
 *                         type: string
 *                         format: date
 *                         description: 마감일
 *                         example: "2025-01-01"
 *                       writer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 사용자 ID
 *                             example: 3
 *                           name:
 *                             type: string
 *                             description: 사용자 이름
 *                             example: "위동화"
 *                           profile_img:
 *                             type: string
 *                             format: uri
 *                             description: 프로필 이미지 URL
 *                             example: "https://cdn.myfit.com/profile/3.jpg"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total_page:
 *                       type: integer
 *                       description: 전체 페이지 수
 *                       example: 1
 *       400:
 *         description: 잘못된 요청 (상태 코드 400)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효하지 않은 요청입니다."
 *       500:
 *         description: 서버 오류 (상태 코드 500)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버에 오류가 발생했습니다."
 */
router.get('/subscribe', isAuthenticated, subscriptionController.getSubscribedRecruitments)

//GET /api/recruiments/:recruitmentId : 리크루트 상세 조회
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
 *         name: recruitmentId
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
 *                   type: array
 *                   description: 소분류 분야
 *                   items:
 *                      type: string
 *                   example: 
 *                      - "프론트엔드 개발자" 
 *                      - "백엔드 개발자"
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

// DELETE /api/recruitments/:recruitmentId
/**
 * @swagger
 * /api/recruitments/{recruitmentId}:
 *   delete:
 *     summary: 채용 공고 삭제
 *     description: 특정 채용 공고를 삭제합니다
 *     tags:
 *       - Recruitments
 *     parameters:
 *       - in: path
 *         name: recruitmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채용 공고 ID
 *         example: 26
 *     responses:
 *       200:
 *         description: 공고가 성공적으로 삭제되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "공고 공고가 삭제되었습니다."
 *       401:
 *         description: 권한이 없음 (상태 코드 401)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인이 필요한 요청입니다."
 *       404:
 *         description: 공고가 존재하지 않음 (상태코드 404)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류 (상태 코드 500)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버에 오류가 발생했습니다."
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:recruitmentId', isAuthenticated, recruitmentController.deleteRecruitment)

// POST /api/recruitments/:recruitmentId/subscribe : 리크루팅 구독하기
/**
 * @swagger
 * /api/recruitments/{recruitmentId}/subscribe:
 *   post:
 *     summary: 채용 공고 구독
 *     description: 특정 채용 공고를 구독합니다
 *     tags:
 *       - Recruitments
 *     parameters:
 *       - in: path
 *         name: recruitmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채용 공고 ID
 *         example: 26
 *     responses:
 *       200:
 *         description: 구독이 완료되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "구독이 완료되었습니다."
 *       401:
 *         description: 권한이 없음 (상태 코드 401)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인이 필요한 요청입니다."
 *       404:
 *         description: 공고가 존재하지 않음 (상태코드 404)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 공고를 찾을 수 없습니다."
 *       409:
 *         description: 이미 구독한 공고임 (상태 코드 409)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "이미 구독한 공고입니다."
 *       500:
 *         description: 서버 오류 (상태 코드 500)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버에 오류가 발생했습니다."
 *     security:
 *       - bearerAuth: []
 */
router.post('/:recruitmentId/subscribe', isAuthenticated, subscriptionController.subscribeRecruitment)

// DELETE /api/recruitments/:recruitmentId/subscribe : 리크루팅 구독 해제
/**
 * @swagger
 * /api/recruitments/{recruitmentId}/subscribe:
 *   delete:
 *     summary: 채용 공고 구독 취소
 *     description: 특정 채용 공고의 구독을 취소합니다
 *     tags:
 *       - Recruitments
 *     parameters:
 *       - in: path
 *         name: recruitmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채용 공고 ID
 *         example: 26
 *     responses:
 *       200:
 *         description: 구독이 취소되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "구독이 취소되었습니다."
 *       400:
 *         description: 구독한 공고가 아님 (상태 코드 400)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 공고를 구독한 내역이 없습니다."
 *       401:
 *         description: 권한이 없음 (상태 코드 401)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인이 필요한 요청입니다."
 *       404:
 *         description: 공고가 존재하지 않음 (상태코드 404)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류 (상태 코드 500)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버에 오류가 발생했습니다."
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:recruitmentId/subscribe', isAuthenticated, subscriptionController.unSubscribeRecruitment)

export default router
