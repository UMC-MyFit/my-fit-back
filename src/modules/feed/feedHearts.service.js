import Heart from './feedHearts.model.js'
import { InternalServerError, BadRequestError, NotFoundError, ConflictError, CustomError } from '../../middlewares/error.js';

class HeartService {
    async createHeart(serviceId, feedId) {
        try {
            await Heart.create(serviceId, feedId)
            return
        }
        catch (error) {
            console.error('하트 생성 오류:', error)

            if (error?.code === 'P2003') {
                throw new NotFoundError({
                    message:
                        '해당 service_id에 해당하는 서비스가 존재하지 않습니다.',
                })
            }
            throw new InternalServerError({
                message: '하트 등록 실패',
            })
        }
    }
    async deleteHeart(serviceId, feedId) {
        try {
            console.log(feedId)
            await Heart.delete(serviceId, feedId)
            return
        }
        catch (error) {
            console.error('하트 삭제 중 오류:', error);

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

export default new HeartService();
