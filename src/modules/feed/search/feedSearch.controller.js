import FeedSearchService from './feedSearch.service.js';
import { BadRequestError, NotFoundError } from '../../../middlewares/error.js';

class FeedSearchController {
    async searchProfile(req, res, next) {
        try {
            const limit = 10;
            const { name } = req.query;
            const lastProfileId = req.query.last_profile_id ? parseInt(req.query.last_profile_id) : null;
            if (!name || typeof name !== 'string') {
                throw new BadRequestError({
                    message: '검색어는 필수입니다.'
                });
            }

            const users = await FeedSearchService.searchProfile(name, lastProfileId, limit);
            const hasMore = users.length === limit;
            const nextCursorId = hasMore && users.length > 0 ? users[users.length - 1].id : null;

            return res.success({
                code: 200,
                message: '피드 유저 검색 결과를 성공적으로 조회했습니다.',
                result: {
                    users,
                    pagination: {
                        has_next: hasMore,
                        next_cursor: nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('피드 검색 중 오류:', error);
            next(error);
        }
    }
    async searchFeedsByKeyword(req, res, next) {
        try {
            const limit = 100;
            const { keyword } = req.query;
            const lastFeedId = req.query.last_feed_id ? parseInt(req.query.last_feed_id) : null;
            const feeds = await FeedSearchService.searchFeedsByKeyword(keyword, lastFeedId, limit);
            const hasMore = feeds.length === limit;
            const nextCursorId = hasMore && feeds.length > 0 ? feeds[feeds.length - 1].feed_id : null;

            return res.success({
                code: 200,
                message: '키워드로 피드 검색 결과를 성공적으로 조회했습니다.',
                result: {
                    feeds,
                    pagination: {
                        has_next: hasMore,
                        next_cursor: nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('키워드로 피드 검색 중 오류:', error);
            next(error);
        }
    }
    async searchFeedsByHashtag(req, res, next) {
        try {
            const limit = 30;
            const { hashtag } = req.query;
            const lastFeedId = req.query.last_feed_id ? parseInt(req.query.last_feed_id) : null;
            const feeds = await FeedSearchService.searchFeedsByHashtag(hashtag, lastFeedId, limit);
            const hasMore = feeds.length === limit;
            const nextCursorId = hasMore && feeds.length > 0 ? feeds[feeds.length - 1].feed_id : null;

            return res.success({
                code: 200,
                message: '해시태그로 피드 검색 결과를 성공적으로 조회했습니다.',
                result: {
                    feeds,
                    pagination: {
                        has_next: hasMore,
                        next_cursor: nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('해시태그로 피드 검색 중 오류:', error);
            next(error);
        }
    }
    async searchSimilarHashtags(req, res, next) {
        try {
            const limit = 10;
            const { keyword } = req.query;
            const lastHashtagId = req.query.last_hashtag_id ? parseInt(req.query.last_hashtag_id) : null;
            const hashtags = await FeedSearchService.searchSimilarHashtags(keyword, lastHashtagId, limit);
            const hasMore = hashtags.length === limit;
            const nextCursorId = hasMore && hashtags.length > 0 ? hashtags[hashtags.length - 1].id : null;

            return res.success({
                code: 200,
                message: '유사한 해시태그 검색 결과를 성공적으로 조회했습니다.',
                result: {
                    hashtags,
                    pagination: {
                        has_next: hasMore,
                        next_cursor: nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('유사한 해시태그 검색 중 오류:', error);
            next(error);
        }
    }

}

export default new FeedSearchController();