// services/feedService.js

import Feed from './feed.model.js';
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../middlewares/error.js';

class FeedService {
    async createFeed(feedData, serviceId) {
        try {
            const processedHashtag = feedData.hashtag && Array.isArray(feedData.hashtag) && feedData.hashtag.length > 0
                ? feedData.hashtag.join(',')
                : '';

            const newFeedData = {
                feed_text: feedData.feed_text,
                hashtag: processedHashtag,
                service_id: serviceId,
                images: feedData.images || [],
                created_at: new Date(),
                updated_at: new Date()
            };

            const createdFeed = await Feed.create(newFeedData);

            return {
                feed_id: createdFeed.id
            };
        } catch (error) {
            console.error('피드 서비스 오류:', error);

            if (error.code === 'P2002') {
                throw new ConflictError({ message: '중복된 데이터입니다.' });
            }
            if (error.code === 'P2003') {
                throw new BadRequestError({ message: '존재하지 않는 서비스 ID입니다.' });
            }

            if (error instanceof CustomError) {
                throw error;
            }

            throw new InternalServerError({ originalError: error.message });
        }
    }

    async getAllFeeds(limit = 10, lastFeedId = null) { // lastFeedCreatedAt 제거
        try {
            const feeds = await Feed.findAll(limit, lastFeedId);
            return feeds;
        } catch (error) {
            console.error('전체 피드 목록 조회 서비스 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }

    async deleteFeed(feedId) {
        try {
            const deletedFeed = await Feed.hide(feedId);

            return {
                feed_id: deletedFeed.id,
                deleted_at: deletedFeed.updated_at
            };
        } catch (error) {
            console.error('피드 삭제 중 오류:', error);

            if (error.code === 'P2025') {
                throw new NotFoundError({ message: '삭제할 피드를 찾을 수 없습니다.' });
            }
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default new FeedService();