import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth.js';
import feedSearchController from './feedSearch.controller.js';
const router = express.Router();

//GET api/feeds/search/profiles
/**
 * @swagger
 * /api/feeds/search/profiles:
 *   get:
 *     summary: 피드 유저 검색
 *     description: 이름으로 피드 유저를 검색합니다.
 *     tags: [FeedSearch]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 이름
 *       - in: query
 *         name: last_profile_id
 *         schema:
 *           type: integer
 *         description: 다음 페이지의 시작 프로필 ID (커서 기반 페이징)
 *     responses:
 *       200:
 *         description: 피드 유저 검색 결과를 성공적으로 조회했습니다.
 */
router.get('/profiles', feedSearchController.searchProfile);

// GET api/feeds/search/keyword
/**
 * @swagger
 * /api/feeds/search/keyword:
 *   get:
 *     summary: 피드 키워드로 검색
 *     description: 키워드로 피드 유저를 검색합니다.
 *     tags: [FeedSearch]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 키워드
 *       - in: query
 *         name: last_feed_id
 *         schema:
 *           type: integer
 *         description: 다음 페이지의 시작 피드 ID (커서 기반 페이징)
 *     responses:
 *       200:
 *         description: 키워드 피드 검색 결과를 성공적으로 조회했습니다.
 */
router.get('/keyword', isAuthenticated, feedSearchController.searchFeedsByKeyword);

// GET api/feeds/search/hashtag
/**
 * @swagger
 * /api/feeds/search/hashtag:
 *   get:
 *     summary: 피드 해시태그로 검색
 *     description: 해시태그로 피드를 검색합니다.
 *     tags: [FeedSearch]
 *     parameters:
 *       - in: query
 *         name: hashtag
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 키워드
 *       - in: query
 *         name: last_feed_id
 *         schema:
 *           type: integer
 *         description: 다음 페이지의 시작 피드 ID (커서 기반 페이징)
 *     responses:
 *       200:
 *         description: 키워드 피드 검색 결과를 성공적으로 조회했습니다.
 */
router.get('/hashtag', feedSearchController.searchFeedsByHashtag);
// GET api/feeds/search/hashtag/analyze
/**
 * @swagger
 * /api/feeds/search/hashtag/analyze:
 *   get:
 *     summary: 키워드로 해시태그로 검색
 *     description: 키워드로 해시태그를 검색합니다.
 *     tags: [FeedSearch]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 키워드
 *       - in: query
 *         name: last_hashtag_id
 *         schema:
 *           type: integer
 *         description: 다음 해시태그의 시작 피드 ID (커서 기반 페이징)
 *     responses:
 *       200:
 *         description: 키워드 피드 검색 결과를 성공적으로 조회했습니다.
 */

router.get('/hashtag/analyze', feedSearchController.searchSimilarHashtags);
export default router;
