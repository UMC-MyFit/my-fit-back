import express from 'express';
import feedController from './feed.controller.js';
import commentController from './feedComments.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router();

// POST /api/feeds - 피드 생성
/**
 * @swagger
 * /api/feeds:
 *   post:
 *     summary: 피드 생성
 *     description: 새로운 피드를 생성합니다.
 *     tags:
 *       - Feeds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feed_text
 *               - hashtag
 *               - service_id
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: 피드에 포함될 이미지 URL 배열
 *                 example:
 *                   - "https://cdn.myfit.com/feed/26_1.jpg"
 *                   - "https://cdn.myfit.com/feed/26_2.jpg"
 *               feed_text:
 *                 type: string
 *                 description: 피드 내용 텍스트
 *                 example: "^-^ 마케팅 트렌드 정리 및 인사이트 공유!"
 *               hashtag:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 해시태그 배열
 *                 example: ["마케팅", "^-^미디어", "광고"]
 *               service_id:
 *                 type: integer
 *                 description: 피드를 올린 사람의 service_id
 *                 example: 3
 *     responses:
 *       200:
 *         description: 피드가 성공적으로 등록되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시글이 성공적으로 등록되었습니다."
 *                 feed_id:
 *                   type: integer
 *                   example: 27
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

router.post('/', isAuthenticated, feedController.createFeed);

/**
 * @swagger
 * /api/feeds:
 *   get:
 *     summary: 전체 피드 목록 조회
 *     description: 모든 피드 목록을 조회합니다.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: query
 *         name: last_feed_id
 *         schema:
 *           type: integer
 *         description: 마지막 피드 ID (페이지네이션용)
 *         example: 27
 *     responses:
 *       200:
 *         description: 피드 목록 조회 성공
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
 *                   example: "전체 피드 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     feeds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feed_id:
 *                             type: integer
 *                             example: 27
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               name:
 *                                 type: string
 *                                 example: "김철수"
 *                               sector:
 *                                 type: string
 *                                 example: "프론트엔드 개발"
 *                               profile_img:
 *                                 type: string
 *                                 example: "https://cdn.myfit.com/feed/26_1.jpg"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-15T09:16:59.334Z"
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uri
 *                             example: ["https://cdn.myfit.com/feed/26_1.jpg","https://cdn.myfit.com/feed/26_2.jpg"]
 *                           feed_text:
 *                             type: string
 *                             example: "^-^ 마케팅 트렌드 정리 및 인사이트 공유!"
 *                           hashtags:
 *                             type: string
 *                             example: "[마케팅, ^-^미디어, 광고]"
 *                           heart:
 *                             type: integer
 *                             example: 1
 *                           comment_count:
 *                             type: integer
 *                             example: 5
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                           example: false
 *                         nextCursorId:
 *                           type: integer
 *                           nullable: true
 *                           example: 17
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
router.get('/', isAuthenticated, feedController.getAllFeeds);

// DELETE /api/feeds/:feedId - 피드 삭제
/**
 * @swagger
 * /api/feeds/{feedId}:
 *   delete:
 *     summary: 피드 삭제
 *     description: 특정 피드를 삭제합니다.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: path
 *         name: feedId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 피드의 ID
 *         example: 27
 *     responses:
 *       200:
 *         description: 피드가 성공적으로 삭제되었습니다.
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
 *                   example: "피드가 성공적으로 삭제되었습니다."
 *                 result:
 *                   type: object
 *                   description: 삭제 결과 정보
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 피드 ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 field:
 *                   type: string
 *                   example: "feedId"
 *                 message:
 *                   type: string
 *                   example: "유효한 피드 ID가 필요합니다."
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
router.delete('/:feedId', isAuthenticated, feedController.deleteFeed);

// POST /api/feeds/:feedId/comment - 댓글 생성
/**
 * @swagger
 * /api/feeds/{feedId}/comments:
 *   post:
 *     summary: 댓글 등록
 *     description: 27번 피드에 대한 댓글을 작성
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: feedId
 *         required: true
 *         description: 피드 ID
 *         schema:
 *           type: integer
 *           example: 27
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment_text
 *             properties:
 *               comment_text:
 *                 type: string
 *                 description: 댓글 텍스트
 *                 example: "좋은 글 감사합니다."
 *               high_comment_id:
 *                 type: integer
 *                 description: 대댓글일 경우, 상위 댓글의 id. 일반 댓글일 경우 null
 *                 nullable: true
 *                 example: null
 *     responses:
 *       201:
 *         description: 댓글 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글 등록이 완료되었습니다."
 *                 comment_id:
 *                   type: integer
 *                   example: 137
 *       404:
 *         description: 해당 피드가 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "피드가 존재하지 않습니다."
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
 *     security:
 *       - bearerAuth: []
 */
router.post('/:feedId/comments', isAuthenticated, commentController.createComment);

/**
 * @swagger
 * /api/feeds/{feedId}/comments:
 *   get:
 *     summary: 댓글 목록 조회
 *     description: 특정 피드의 댓글 목록을 조회합니다 (답글 포함)
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: feedId
 *         required: true
 *         description: 피드 ID
 *         schema:
 *           type: integer
 *           example: 13
 *       - in: query
 *         name: last_comment_id
 *         required: false
 *         description: 마지막 댓글 ID (커서 기반 페이지네이션)
 *         schema:
 *           type: integer
 *           example: 100
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 100
 *                       comment_text:
 *                         type: string
 *                         example: "좋은 글 감사합니다."
 *                       high_comment_id:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-04T08:10:00Z"
 *                       writer:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 9
 *                           name:
 *                             type: string
 *                             example: "김민수"
 *                           job:
 *                             type: string
 *                             example: "개발자"
 *                           profile_image_url:
 *                             type: string
 *                             example: "https://myfit.com/images/users/7.jpg"
 *                       replies:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 281
 *                             comment_text:
 *                               type: string
 *                               example: "저도 좋은 글이라 생각합니다."
 *                             high_comment_id:
 *                               type: integer
 *                               example: 100
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-07-04T08:26:00Z"
 *                             writer:
 *                               type: object
 *                               properties:
 *                                 user_id:
 *                                   type: integer
 *                                   example: 9
 *                                 name:
 *                                   type: string
 *                                   example: "박서준"
 *                                 job:
 *                                   type: string
 *                                   example: "백엔드 개발자"
 *                                 profile_image_url:
 *                                   type: string
 *                                   example: "https://myfit.com/images/users/4.jpg"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "유효하지 않은 피드 ID입니다."
 *       404:
 *         description: 피드를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 피드가 존재하지 않습니다."
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
 *     security:
 *       - bearerAuth: []
 */
router.get('/:feedId/comments', commentController.getAllcomment);

export default router;