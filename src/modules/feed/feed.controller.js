// controllers/feedController.js
import feedService from '../services/feedService.js';
import { BadRequestError, NotFoundError } from '../middlewares/error.js';

class FeedController {
    async createFeed(req, res, next) {
        try {
            const feedData = req.body;

            if (!feedData.images || !Array.isArray(feedData.images) || feedData.images.length === 0) {
                throw new BadRequestError({ field: 'images', message: '이미지는 필수입니다.' });
            }

            if (!feedData.feed_text || typeof feedData.feed_text !== 'string') {
                throw new BadRequestError({ field: 'feed_text', message: '피드 텍스트는 필수입니다.' });
            }

            if (!feedData.service_id || typeof feedData.service_id !== 'number') {
                throw new BadRequestError({ field: 'service_id', message: '서비스 ID는 필수입니다.' });
            }

            if (feedData.hashtag && !Array.isArray(feedData.hashtag)) {
                throw new BadRequestError({ field: 'hashtag', message: '해시태그는 배열 형태여야 합니다.' });
            }

            const result = await feedService.createFeed(feedData);

            return res.success({
                code: 201,
                message: '게시글이 성공적으로 등록되었습니다.',
                result: {
                    feed_id: result.feed_id
                }
            });
        } catch (error) {
            console.error('피드 생성 중 오류:', error);
            next(error);
        }
    }

    async getAllFeeds(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const lastFeedId = req.query.last_feed_id ? parseInt(req.query.last_feed_id) : null;
            const feeds = await feedService.getAllFeeds(limit, lastFeedId);

            const hasMore = feeds.length === limit;
            const nextCursorId = hasMore && feeds.length > 0 ? feeds[feeds.length - 1].id : null;

            return res.success({
                code: 200,
                message: '전체 피드 목록을 성공적으로 조회했습니다.',
                result: {
                    feeds,
                    pagination: {
                        limit,
                        hasMore,
                        nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('전체 피드 목록 조회 중 오류:', error);
            next(error);
        }
    }

    async deleteFeed(req, res, next) {
        try {
            const { feedId } = req.params;

            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({ field: 'feedId', message: '유효한 피드 ID가 필요합니다.' });
            }

            const result = await feedService.deleteFeed(parseInt(feedId));

            return res.success({
                code: 200,
                message: '피드가 성공적으로 삭제되었습니다.',
                result
            });
        } catch (error) {
            console.error('피드 삭제 중 오류:', error);
            next(error);
        }
    }
}

export default new FeedController();