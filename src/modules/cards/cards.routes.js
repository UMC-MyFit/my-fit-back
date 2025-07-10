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

// 활동 카드 상세 조회
router.get('/:card_id', cardsController.getCardById)
export default router
