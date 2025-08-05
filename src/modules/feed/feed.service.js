// services/feedService.js

import Feed from './feed.model.js';
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../middlewares/error.js';
import { listToString, stringToList } from '../../libs/dataTransformer.js';

class FeedService {
    async createFeed(feedData, serviceId) {
        try {
            const processedHashtag = await listToString(feedData.hashtag);
            const processedHashtagToList = await stringToList(processedHashtag);
            const uploadHashtagsPromises = Feed.uploadRecentHashtags(serviceId, processedHashtagToList);
            const newFeedData = {
                feed_text: feedData.feed_text,
                hashtag: processedHashtag,
                service_id: serviceId,
                images: feedData.images || [],
                created_at: new Date(),
                updated_at: new Date()
            };

            const createdFeed = await Feed.create(newFeedData);
            await uploadHashtagsPromises;
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

    async getAllFeeds(serviceId, lastFeedId = null, limit = 10) {
        try {
            const feeds = await Feed.findAll(serviceId, lastFeedId, limit);
            return feeds;
        } catch (error) {
            console.error('전체 피드 목록 조회 서비스 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }

    async getFeedById(serviceId, feedId) {
        try {
            const feed = await Feed.findById(serviceId, feedId);
            if (!feed) {
                throw new NotFoundError({ message: '아이디에 해당하는 피드가 없습니다' })
            }
            return feed;
        }
        catch (error) {
            console.error('아이디에 해당하는 피드 검색 중 오류 : ', error)
            throw error
        }
    }

    async updateFeed(feedId, feedData, serviceId) {
        try {
            const processedHashtag = await listToString(feedData.hashtag);
            const processedHashtagToList = await stringToList(processedHashtag);
            const uploadHashtagsPromises = Feed.uploadRecentHashtags(serviceId, processedHashtagToList);
            const newFeedData = {
                feed_text: feedData.feed_text,
                hashtag: processedHashtag,
                service_id: serviceId,
                images: feedData.images || [],
                updated_at: new Date()
            };
            const updatedFeed = await Feed.update(feedId, newFeedData, serviceId);
            await uploadHashtagsPromises;
            return {
                feed_id: updatedFeed.id
            };
        } catch (error) {
            console.error('피드 업데이트 중 오류:', error);
            if (error.code === 'P2025') {
                throw new NotFoundError({ message: '업데이트할 피드를 찾을 수 없습니다.' });
            }
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