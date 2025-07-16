import express from 'express';
import feedController from './feedComments.controller.js';
import { isAuthenticated } from '../../middlewares/auth.js'
const router = express.Router();

// 댓글 생성
router.post('/:feedId/comments', isAuthenticated, feedController.createFeed);