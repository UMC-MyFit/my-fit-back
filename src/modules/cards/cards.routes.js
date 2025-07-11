import express from 'express'
import cardsController from './cards.controller.js'

const router = express.Router()

/**
 * @swagger
 * /api/cards:
 *   post:
 *     tags:
 *        - Cards
 *     summary: 이력/활동 카드 등록
 *     description: 활동 카드 정보를 등록하고 키워드와 연결합니다. (임시로 body에 service_id 들어감. 원래는 세션 사용해서 안들어감)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 12
 *               card_img:
 *                 type: string
 *                 example: "https://cdn.example.com/cards/card_img01.png"
 *               card_one_line_profile:
 *                 type: string
 *                 example: "사이드 프로젝트 매니아"
 *               detailed_profile:
 *                 type: string
 *                 example: "Vue, React 기반 프로젝트 경험 다수. UI/UX에 관심이 많습니다."
 *               link:
 *                 type: string
 *                 example: "https://github.com/chulsoo123"
 *               keyword_text:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "사이드 프로젝트", "UI/UX"]
 *     responses:
 *       201:
 *         description: 활동 카드 등록 성공
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
 *                   example: 활동 카드 등록 성공
 *                 result:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: integer
 *                       example: 3
 *                     service_id:
 *                       type: integer
 *                       example: 12
 *                     message:
 *                       type: string
 *                       example: 이력/활동 카드 등록 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

// 이력/활동 카드 등록
router.post('/', cardsController.createCard)

/**
 * @swagger
 * /api/cards:
 *   post:
 *     tags:
 *       - Cards
 *     summary: 이력/활동 카드 등록
 *     description: 활동 카드 정보를 등록하고 키워드와 연결합니다. (임시로 body에 service_id 들어감. 원래는 세션 사용해서 안들어감)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 12
 *               card_img:
 *                 type: string
 *                 example: "https://cdn.example.com/cards/card_img01.png"
 *               card_one_line_profile:
 *                 type: string
 *                 example: "사이드 프로젝트 매니아"
 *               detailed_profile:
 *                 type: string
 *                 example: "Vue, React 기반 프로젝트 경험 다수. UI/UX에 관심이 많습니다."
 *               link:
 *                 type: string
 *                 example: "https://github.com/chulsoo123"
 *               keyword_text:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "사이드 프로젝트", "UI/UX"]
 *     responses:
 *       201:
 *         description: 활동 카드 등록 성공
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
 *                   example: "활동 카드 등록 성공"
 *                 result:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: integer
 *                       example: 3
 *                     service_id:
 *                       type: integer
 *                       example: 12
 *                     message:
 *                       type: string
 *                       example: "이력/활동 카드 등록 성공"
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/cards/swipe:
 *   get:
 *     summary: 필터 조건에 따라 활동 카드 목록 조회
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         required: false
 *         description: "페이징을 위한 커서"
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         required: false
 *         description: "활동 지역 ID (high_area_id)"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: "활동 상태 (예: 이직 준비 중)"
 *       - in: query
 *         name: hope_job
 *         schema:
 *           type: string
 *         required: false
 *         description: "작성자의 희망 직무 (예: 백엔드 개발)"
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: false
 *         style: form
 *         explode: true
 *         description: "키워드 목록"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest]
 *         required: false
 *         description: "정렬 기준 (latest: 최신순, oldest: 오래된순)"
 *     responses:
 *       200:
 *         description: 카드 목록 필터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: "카드 목록 필터 조회 성공"
 *                 result:
 *                   cards:
 *                     - card_id: 23
 *                       title: "백엔드 개발"
 *                       image_url: "https://myfit.com/cards/23.jpg"
 *                       one_line_profile: "사이드 프로젝트 매니아"
 *                       tags: ["사이드 프로젝트", "UI/UX", "React"]
 *                     - card_id: 4
 *                       title: "백엔드 개발"
 *                       image_url: "https://myfit.com/cards/4.jpg"
 *                       one_line_profile: "나는 백엔드 개발자"
 *                       tags: ["사이드_프로젝트", "node.js"]
 *                   total_count: 3
 *                   next_cursor: null
 *                   has_next: false
 *       400:
 *         description: 유효하지 않은 쿼리 파라미터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 400
 *                 message: "잘못된 요청입니다. 입력값을 확인해주세요."
 *                 result:
 *                   errorCode: "C001"
 *                   data:
 *                     message: "잘못된 쿼리 파라미터가 포함되어 있습니다:"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: "서버에 오류가 발생하였습니다."
 *                 result:
 *                   errorCode: "S001"
 *                   data:
 *                     message: "서버에 오류가 발생하였습니다."
 */

// 이력/활동 카드 스와이프 조회
router.get('/swipe', cardsController.getFilteredCards)

/**
 * @swagger
 * /api/cards/{card_id}:
 *   get:
 *     summary: 이력/활동 카드 상세 조회
 *     description: 카드 ID를 이용해 해당 활동 카드의 상세 정보를 조회합니다.
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 활동 카드의 ID
 *     responses:
 *       200:
 *         description: 이력/활동 카드 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: true
 *                 code: 200
 *                 message: "이력/활동 카드 상세 조회 성공"
 *                 result:
 *                   card:
 *                     id: 24
 *                     card_img: "https://cdn.example.com/cards/card_img01.png"
 *                     card_one_line_profile: "사이드 프로젝트 매니아"
 *                     detailed_profile: "Vue, React 기반 프로젝트 경험 다수. UI/UX에 관심이 많습니다."
 *                     link: "https://github.com/chulsoo123"
 *                     keyword_text: ["사이드 프로젝트", "React", "UI/UX"]
 *                     writer:
 *                       id: 15
 *                       name: "김철수"
 *                       sector: "프론트엔드 개발"
 *                       profile_img_url: ""
 *       401:
 *         description: 로그인하지 않은 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 401
 *                 message: "로그인이 필요한 요청입니다."
 *                 result:
 *                       errorCode: "A001"
 *                       data:
 *                           message: "로그인이 필요한 요청입니다."
 *       404:
 *         description: 이력/활동 카드가 존재하지 않을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 404
 *                 message: "요청한 리소스를 찾을 수 없습니다."
 *                 result:
 *                   errorCode: "C002"
 *                   data:
 *                      message: "해당 이력/활동 카드가 존재하지 않습니다."
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 isSuccess: false
 *                 code: 500
 *                 message: "서버에 오류가 발생하였습니다."
 *                 result:
 *                   errorCode: "S001"
 *                   data:
 *                      message: "서버에 오류가 발생하였습니다."
 */

// 이력/활동 카드 상세 조회
router.get('/:card_id', cardsController.getCardById)

export default router
