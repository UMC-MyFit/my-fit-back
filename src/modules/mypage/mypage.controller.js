import MypageService from './mypage.service.js';
import { BadRequestError } from '../../middlewares/error.js';

class MypageController {
    /**
     * GET /api/mypage/:userId/profile_info 요청을 처리하여 사용자 프로필 정보를 반환합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     * @param {Function} next - 다음 미들웨어 함수
     */
    static async getUserProfileInfo(req, res, next) {
        try {
            const { userId } = req.params;

            // 1. 입력값 유효성 검사: userId가 유효한 숫자인지 확인
            if (!userId || isNaN(userId) || parseInt(userId).toString() !== userId.toString()) {
                throw new BadRequestError({ field: 'userId', message: '유효한 사용자 ID가 필요합니다.' });
            }

            // 2. MypageService의 getUserProfileInfo 메서드 호출하여 비즈니스 로직 수행
            const userProfile = await MypageService.getUserProfileInfo(userId);

            // 3. 성공 응답 전송 (res.success는 responseHandler 미들웨어에서 제공)
            return res.success({
                code: 200,
                message: '사용자 프로필 정보를 성공적으로 조회했습니다.',
                result: userProfile, // 조회된 프로필 정보 포함
            });
        } catch (error) {
            // 오류 발생 시 다음 에러 핸들링 미들웨어로 전달
            console.error('MypageController - 사용자 프로필 조회 중 오류:', error);
            next(error);
        }
    }
}

export default MypageController;