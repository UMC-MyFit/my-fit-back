import MypageModel from './mypage.model.js';
import { NotFoundError, InternalServerError, BadRequestError, CustomError } from '../../middlewares/error.js';

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
                user_id: updateUser.user_id,
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

    /**
     * 서비스의 recruiting_status를 업데이트
     * @param {string} userId  
     * @param {string} newStatus - 업데이트할 새로운 상태 값
     * @returns {Promise<Object>} 업데이트된 서비스 정보
     * @throws {NotFoundError} 
     * @throws {BadRequestError} 
     * @throws {InternalServerError} 
     */
    static async updateRecruitingStatus(userId, newStatus) {
        // 허용되는 recruiting_status 값 목록 
        const ALLOWED_STATUSES = ['구직 중', '구인 중', '구인 협의 중', '네트워킹 환영', '해당 없음']; 

        try {
            // 1. 유효성 검사: newStatus가 허용되는 값인지 확인
            if (!ALLOWED_STATUSES.includes(newStatus)) { // 대소문자 구분 없이 처리
                throw new BadRequestError({ message: `'${newStatus}'은(는) 유효하지 않은 모집 상태 값입니다. 허용되는 값: ${ALLOWED_STATUSES.join(', ')}` });
            }

            // 2. 사용자 존재 여부 확인
            const existingUser = await MypageModel.findUserProfileById(BigInt(userId));
            if (!existingUser) {
                throw new NotFoundError('해당 사용자를 찾을 수 없습니다.');
            }

            // 3. 모델 계층 호출하여 recruiting_status 업데이트
            const updatedServiceResult = await MypageModel.updateRecruitingStatus(BigInt(userId), newStatus);

            // 연결된 서비스가 없어서 업데이트가 이루어지지 않은 경우
            if (!updatedServiceResult) {
                throw new NotFoundError('해당 사용자와 연결된 서비스를 찾을 수 없습니다.');
            }

            // 모델에서 반환된 값을 그대로 반환
            return updatedServiceResult;

        } catch (error) {
            console.error('MypageService - 모집 상태 업데이트 서비스 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            if (error.code === 'P2025') { 
                throw new NotFoundError('서비스를 찾을 수 없습니다.'); 
            }
            throw new InternalServerError({ message: '유저 상태를 수정하는 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * 관심 관계를 토글합니다 (생성 또는 삭제).
     * 비즈니스 로직: 자기 자신에게 관심 신청 금지, 차단한/차단당한 사용자에게 신청 불가, 이미 관심 있으면 해제, 없으면 생성.
     * @param {BigInt} senderServiceId - 관심을 보내는 사용자 (나)의 Service ID
     * @param {BigInt} targetServiceId - 관심을 받는 상대방의 Service ID
     * @returns {Promise<string>} 성공 메시지 (생성 또는 해제)
     * @throws {BadRequestError} 자기 자신에게 신청 시도
     * @throws {ForbiddenError} 차단 관계 (내가 차단했거나 상대방이 나를 차단함)
     * @throws {NotFoundError} 상대방 서비스를 찾을 수 없음
     * @throws {InternalServerError} 기타 DB 또는 서버 오류
     */
    static async toggleInterest(senderServiceId, targetServiceId) {
        try {
            // 1. 자기 자신에게 관심 신청 금지
            if (senderServiceId === targetServiceId) {
                throw new BadRequestError({ message: '자기 자신에게는 관심을 신청할 수 없습니다.' });
            }


            // 2. 상대방 서비스 존재 여부 확인
            const targetServiceExists = await MypageModel.findServiceById(targetServiceId);
            if (!targetServiceExists) {
                throw new NotFoundError('상대방 서비스를 찾을 수 없습니다.');
            }


            // 3. 차단 관계 확인
            // 내가 상대방을 차단했는지 또는 상대방이 나를 차단했는지 확인
            const isBlockedBySender = await MypageModel.isBlocked(senderServiceId, targetServiceId);
            if (isBlockedBySender) {
                throw new ForbiddenError({ message: '차단한 사용자에게는 관심 요청을 할 수 없습니다.' });
            }


            const isBlockedByRecipient = await MypageModel.isBlocked(targetServiceId, senderServiceId);
            if (isBlockedByRecipient) {
                throw new ForbiddenError({ message: '차단당한 사용자에게는 관심 요청을 할 수 없습니다.' });
            }




            // 4. 기존 관심 관계 확인 및 토글 로직
            const existingInterest = await MypageModel.findInterest(senderServiceId, targetServiceId);


            if (existingInterest) {
                // 이미 관심이 있으면 삭제 (해제)
                await MypageModel.deleteInterest(senderServiceId, targetServiceId);
                return '관심이 성공적으로 해제되었습니다.';
            } else {
                // 관심이 없으면 생성 (요청)
                await MypageModel.createInterest(senderServiceId, targetServiceId);
                return '관심이 성공적으로 추가되었습니다.';
            }
        } catch (error) {
            console.error('MypageService - 관심 토글 서비스 오류:', error);
            if (error instanceof CustomError) { // 정의한 커스텀 에러는 그대로 던짐
                throw error;
            }
            // Prisma 고유 제약 조건 위반 에러 (P2002)는 이미 find/delete/create 로직에서 처리되거나
            // 여기서 발생하지 않도록 로직을 설계했으므로, 다른 예상치 못한 에러에 대해 InternalServerError를 던집니다.
            throw new InternalServerError({ message: '관심 요청/해제 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }g
}

export default MypageService;