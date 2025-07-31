import Search from './feedSearch.model.js'
import { InternalServerError, NotFoundError, BadRequestError } from '../../../middlewares/error.js';

class FeedSearchService {
    async searchProfile(name, lastProfileId, limit = 100) {
        try {
            if (!name || typeof name !== 'string') {
                throw new BadRequestError({ message: '검색어는 필수입니다.' });
            }

            const users = await Search.searchUsers(name, lastProfileId, limit);

            if (users.length === 0) {
                throw new NotFoundError({ message: '검색 결과가 없습니다.' });
            }

            return users;
        } catch (error) {
            console.error('피드 유저 검색 오류:', error);
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
    async searchFeedsByKeyword(keyword, lastFeedId, limit = 100) {
        try {
            if (!keyword || typeof keyword !== 'string') {
                throw new BadRequestError({ message: '검색어는 필수입니다.' });
            }

            const feeds = await Search.searchFeedsByKeyword(keyword, lastFeedId, limit);

            if (feeds.length === 0) {
                throw new NotFoundError({ message: '검색 결과가 없습니다.' });
            }

            return feeds;
        } catch (error) {
            console.error('피드 검색 오류:', error);
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }

    async searchFeedsByHashtag(hashtag, lastFeedId, limit = 30) {
        try {
            if (!hashtag || typeof hashtag !== 'string') {
                throw new BadRequestError({ message: '해시태그는 필수입니다.' });
            }

            const feeds = await Search.searchFeedsByHashtag(hashtag, lastFeedId, limit);

            if (feeds.length === 0) {
                throw new NotFoundError({ message: '검색 결과가 없습니다.' });
            }

            return feeds;
        } catch (error) {
            console.error('해시태그로 피드 검색 오류:', error);
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
    async searchSimilarHashtags(hashtag, lastHashtagId, limit = 10) {
        try {
            if (!hashtag || typeof hashtag !== 'string') {
                throw new BadRequestError({ message: '해시태그는 필수입니다.' });
            }

            const hashtags = await Search.searchSimilarHashtags(hashtag, lastHashtagId, limit);

            if (hashtags.length === 0) {
                throw new NotFoundError({ message: '유사한 해시태그가 없습니다.' });
            }

            return hashtags;
        } catch (error) {
            console.error('유사한 해시태그 검색 오류:', error);
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default new FeedSearchService();