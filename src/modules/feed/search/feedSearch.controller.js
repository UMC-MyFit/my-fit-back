import FeedSearchService from './feedSearch.service.js';
import { BadRequestError, NotFoundError } from '../../middlewares/error.js';

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
                        hasMore,
                        nextCursorId
                    }
                }
            });
        } catch (error) {
            console.error('피드 검색 중 오류:', error);
            next(error);
        }
    }
}

export default new FeedSearchController();