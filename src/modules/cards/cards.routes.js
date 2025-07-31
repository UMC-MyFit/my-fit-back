import express from 'express'
import cardsController from './cards.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router()

/**
 * @swagger
 * /api/cards:
 *   post:
 *     tags:
 *        - Cards
 *     summary: 이력/활동 카드 등록
 *     description: 활동 카드 정보를 등록하고 키워드와 연결합니다. ( 첫 이력/활동 카드에선 프로필 등록(1)에서 받은 service_id를 넘겨 주세요. 로그인 상태에선 body에 어떤 service_id를 적어도 로그인한 유저의 service_id로 이력/활동 카드로 생성됨)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 3
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
router.post('/', isAuthenticated, cardsController.createCard)

/**
 * @swagger
 * /api/cards/swipe:
 *   get:
 *     summary: 필터 조건에 따라 이력/활동 카드 스와이프 방식으로 조회
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
 *         description: "활동 지역"
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
 *         style: form
 *         explode: true
 *         required: false
 *         collectionFormat: multi
 *         schema:
 *           type: array
 *           items:
 *             type: string
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
router.get('/swipe', isAuthenticated, cardsController.getFilteredCards)

/**
 * @swagger
 * /api/cards/grid:
 *   get:
 *     summary: 전체보기 카드 리스트 조회 (무한 스크롤)
 *     description: 최신순으로 전체 이력/활동 카드 이미지를 조회합니다. 한 번에 최대 10개씩 불러오며, next_cursor를 기반으로 다음 데이터를 요청할 수 있습니다.
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         required: false
 *         description: 이전 요청에서 받은 next_cursor 값
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         required: false
 *         description: "활동 지역 (예시: 서울)"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: "활동 상태 (예시: 이직 준비 중)"
 *       - in: query
 *         name: hope_job
 *         schema:
 *           type: string
 *         required: false
 *         description: "희망 직무 (예시: 프론트엔드 개발)"
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: false
 *         style: form
 *         explode: true
 *         description: 키워드 목록 예시 keywords=사이드프로젝트&keywords=인턴경험
 *     responses:
 *       200:
 *         description: 카드 전체 보기 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 카드 전체 보기 조회 성공
 *               result:
 *                 cards:
 *                   - card_id: 23
 *                     image_url: https://myfit.com/cards/23.jpg
 *                   - card_id: 3
 *                     image_url: https://myfit.com/cards/3.jpg
 *                 total_count: 2
 *                 next_cursor: null
 *                 has_next: false
 *       400:
 *         description: 잘못된 요청입니다. 입력값을 확인해주세요.
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 400
 *               message: 잘못된 요청입니다. 입력값을 확인해주세요.
 *               result:
 *                 errorCode: C001
 *                 data:
 *                   message: 잘못된 쿼리 파라미터가 포함되어 있습니다
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

router.get('/grid', isAuthenticated, cardsController.getCardgrid)

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
router.get('/:card_id', isAuthenticated, cardsController.getCardById)

export default router
