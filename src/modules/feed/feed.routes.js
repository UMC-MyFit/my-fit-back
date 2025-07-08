import express from 'express';
import feedController from '../controllers/feedController.js';

const router = express.Router();

// POST /api/feeds - 피드 생성
router.post('/', feedController.createFeed);

// GET /api/feeds - 전체 피드 목록 조회 
router.get('/', feedController.getAllFeeds);

// DELETE /api/feeds/:feedId - 피드 삭제
router.delete('/:feedId', feedController.deleteFeed);