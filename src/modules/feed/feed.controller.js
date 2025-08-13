// controllers/feedController.js
import feedService from './feed.service.js';
import { BadRequestError, NotFoundError } from '../../middlewares/error.js';

class FeedController {
    async createFeed(req, res, next) {
        try {
            // 나중에 serviceId = req.session.user.service_id; 로 교체 예정
            const serviceId = req.user.service_id
            const feedData = req.body

            if (!feedData.images || !Array.isArray(feedData.images) || feedData.images.length === 0) {
                throw new BadRequestError({ field: 'images', message: '이미지는 필수입니다.' });
            }

            if (!feedData.feed_text || typeof feedData.feed_text !== 'string') {
                throw new BadRequestError({ field: 'feed_text', message: '피드 텍스트는 필수입니다.' });
            }

            if (!serviceId || typeof serviceId !== 'number') {
                throw new BadRequestError({ field: 'service_id', message: '서비스 ID는 필수입니다.' });
            }

            if (feedData.hashtag && !Array.isArray(feedData.hashtag)) {
                throw new BadRequestError({ field: 'hashtag', message: '해시태그는 배열 형태여야 합니다.' });
            }

            const result = await feedService.createFeed(feedData, serviceId);

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
            const limit = 10
            const serviceId = req.user.service_id
            const lastFeedId = req.query.last_feed_id ? parseInt(req.query.last_feed_id) : null;
            const feeds = await feedService.getAllFeeds(serviceId, lastFeedId, limit);
            const hasMore = feeds.length === limit;
            const nextCursorId = hasMore && feeds.length > 0 ? feeds[feeds.length - 1].feed_id : null;
            return res.success({
                code: 200,
                message: '전체 피드 목록을 성공적으로 조회했습니다.',
                result: {
                    feeds,
                    pagination: {
                        has_next: hasMore,
                        next_cursor: nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('전체 피드 목록 조회 중 오류:', error);
            next(error);
        }
    }

    async getFeedById(req, res, next) {
        try {
            const feedId = req.params.feedId
            const serviceId = req.user.service_id
            if (!feedId) {
                throw new BadRequestError({ field: 'feedId', message: '피드 ID는 필수입니다.' });
            }
            const feed = await feedService.getFeedById(serviceId, feedId)
            return res.success({
                code: 200,
                message: '피드가 정상적으로 검색되었습니다',
                result: {
                    feed
                }
            });
        }
        catch (error) {
            console.error('아이디로 피드 조회 중 오류:', error);
            next(error);
        }
    }

    async updateFeed(req, res, next) {
        try {
            const { feedId } = req.params;
            const serviceId = req.user.service_id;
            const feedData = req.body;
            console.log('feedData:', feedData);
            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({ field: 'feedId', message: '유효한 피드 ID가 필요합니다.' });
            }

            const result = await feedService.updateFeed(feedId, feedData, serviceId);

            return res.success({
                code: 200,
                message: '피드가 성공적으로 수정되었습니다.',
                feed_id: result.feed_id
            });
        } catch (error) {
            console.error('피드 수정 중 오류:', error);
            if (error instanceof NotFoundError) {
                return res.error({
                    code: 404,
                    message: '피드를 찾을 수 없습니다.',
                    error: error.message
                });
            }
            next(error);
        }
    }

    async hideFeed(req, res, next) {
        try {
            const { feedId } = req.params;
            const serviceId = req.user.service_id;
            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({ field: 'feedId', message: '유효한 피드 ID가 필요합니다.' });
            }

            const result = await feedService.hideFeed(parseInt(feedId), serviceId);

            return res.success({
                code: 200,
                message: '피드가 성공적으로 숨겼습니다.',
                result
            });
        } catch (error) {
            console.error('피드 숨기기 중 오류:', error);
            next(error);
        }
    }

    async openFeed(req, res, next) {
        try {
            const { feedId } = req.params;
            const serviceId = req.user.service_id;
            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({ field: 'feedId', message: '유효한 피드 ID가 필요합니다.' });
            }
            const result = await feedService.openFeed(parseInt(feedId), serviceId);
            return res.success({
                code: 200,
                message: '피드가 성공적으로 다시 보여졌습니다.',
                result
            });
        } catch (error) {
            console.error('피드 다시 보여주기 중 오류:', error);
            if (error instanceof NotFoundError) {
                return res.error({
                    code: 404,
                    message: '피드를 찾을 수 없습니다.',
                    error: error.message
                });
            }
            next(error);
        }
    }

    async deleteFeed(req, res, next) {
        try {
            const { feedId } = req.params;
            const serviceId = req.user.service_id;

            if (!feedId || isNaN(feedId)) {
                throw new BadRequestError({ field: 'feedId', message: '유효한 피드 ID가 필요합니다.' });
            }

            const result = await feedService.deleteFeed(parseInt(feedId), serviceId);

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