import MypageModel from './mypage.model.js';
import { NotFoundError, InternalServerError } from '../../middlewares/error.js';

class MypageService {
    /**
     * @param {string} userId - 조회할 사용자의 ID (문자열 형태, BigInt로 변환 필요)
     * @returns {Promise<Object>} 사용자 프로필 정보 객체
     * @throws {NotFoundError} 사용자를 찾을 수 없을 경우
     * @throws {InternalServerError} 기타 예상치 못한 서버 오류 발생 시
     */
    static async getUserProfileInfo(userId) {
        try {
            const userProfile = await MypageModel.findUserProfileById(BigInt(userId));

            if (!userProfile) {
                throw new NotFoundError('사용자 프로필을 찾을 수 없습니다.');
            }

            // 필요하다면 여기서 추가적인 데이터 가공 로직을 수행할 수 있음.
            // 예: birth_date를 특정 포맷으로 변환 등.

            return userProfile;
        } catch (error) {
            console.error('MypageService - 사용자 프로필 조회 서비스 오류:', error);
            // 이미 커스텀 에러라면 그대로 던지고, 아니면 InternalServerError로 변환
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new InternalServerError({ message: '프로필 정보를 가져오는 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * @param {string} userId - 프로필 사진을 수정할 사용자의 ID
     * @param {string} profileImgUrl - 새로운 프로필 사진 URL
     * @returns {Promise<Object>} 업데이트된 사용자 프로필 정보
     * @throws {NotFoundError}
     * @throws {InternalServerError}
     */
    static async updateProfilePicture(userId, profileImgUrl) {
        try {
            // 1. 사용자 존재 여부 확인
            const existingUser = await MypageModel.findUserProfileById(BigInt(userId));

            if (!existingUser) {
                throw new NotFoundError('사용자를 찾을 수 없습니다.');
            }

            // 2. 프로필 사진 업데이트
            const updateUser = await MypageModel.updateProfilePicture(BigInt(userId), profileImgUrl);

            if (!updateUser) {
                throw new InternalServerError({ message: '프로필 사진 업데이트에 실패했습니다.' });
            }

            return {
                user_id: updateUser.id.toString(),
                profile_img: updateUser.profile_img,
            };
        } catch (error) {
            console.error('MypageService - 프로필 사진 업데이트 서비스 오류:', error);
            if (error instanceof CustomError) {
                throw error;  
            }
            if (error.code === 'P2025') {
                throw new NotFoundError('사용자를 찾을 수 없습니다.');
            }
            throw new InternalServerError({ message: '프로필 사진을 수정하는 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }
}

export default MypageService;