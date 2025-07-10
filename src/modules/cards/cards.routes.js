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

export default router
