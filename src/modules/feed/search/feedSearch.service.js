import Search from './feedSearch.model.js'
import { InternalServerError, NotFoundError, BadRequestError } from '../../middlewares/error.js';

class FeedSearchService {
    async searchProfile(name, lastProfileId, limit = 10) {
        try {
            if (!name || typeof name !== 'string') {
                throw new BadRequestError({ message: '검색어는 필수입니다.' });
            }

            const users = await Search.searchProfile(name, lastProfileId, limit);

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
}

export default new FeedSearchService();