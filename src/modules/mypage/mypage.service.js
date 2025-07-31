import MypageModel from './mypage.model.js'
import FeedModel from '../feed/feed.model.js'
import CardsService from '../cards/cards.service.js'
import { NotFoundError, InternalServerError, BadRequestError, CustomError } from '../../middlewares/error.js'

class MypageService {
    /**
     * @param {string} serviceId - 조회할 사용자의 서비스 ID (문자열 형태, BigInt로 변환 필요)
     * @returns {Promise<Object>} 사용자 프로필 정보 객체
     */
    static async getUserProfileInfo(serviceId) {
        try {
            const userProfile = await MypageModel.findUserProfileById(BigInt(serviceId))

            if (!userProfile) {
                throw new NotFoundError('사용자 프로필을 찾을 수 없습니다.')
            }

            // 필요하다면 여기서 추가적인 데이터 가공 로직을 수행할 수 있음.
            // 예: birth_date를 특정 포맷으로 변환 등.

            return userProfile
        } catch (error) {
            console.error('MypageService - 사용자 프로필 조회 서비스 오류:', error)
            if (error instanceof NotFoundError) {
                throw error
            }
            throw new InternalServerError({ message: '프로필 정보를 가져오는 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * @param {string} serviceId - 프로필 사진을 수정할 사용자의 ID
     * @param {string} profileImgUrl - 새로운 프로필 사진 URL
     * @returns {Promise<Object>} 업데이트된 사용자 프로필 정보
     */
    static async updateProfilePicture(serviceId, profileImgUrl) {
        try {
            // 1. 사용자 존재 여부 확인
            const existingUser = await MypageModel.findUserProfileById(BigInt(serviceId))

            if (!existingUser) {
                throw new NotFoundError('사용자를 찾을 수 없습니다.');
            }

            // 2. 프로필 사진 업데이트
            const updated = await MypageModel.updateProfilePicture(BigInt(serviceId), profileImgUrl)
            return updated
        } catch (error) {
            console.error('MypageService - 프로필 사진 업데이트 서비스 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            if (error.code === 'P2025') {
                throw new NotFoundError('사용자를 찾을 수 없습니다.')
            }
            throw new InternalServerError({ message: '프로필 사진을 수정하는 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 서비스의 recruiting_status를 업데이트
     * @param {string} serviceId  
     * @param {string} newStatus - 업데이트할 새로운 상태 값
     * @returns {Promise<Object>} 업데이트된 서비스 정보
     */
    static async updateRecruitingStatus(serviceId, newStatus) {
        // 허용되는 recruiting_status 값 목록 
        const ALLOWED_STATUSES = ['현재 구직 중!', '현재 구인 중!', '구인 협의 중', '네트워킹 환영', '해당 없음']

        try {
            // 1. 유효성 검사: newStatus가 허용되는 값인지 확인
            if (!ALLOWED_STATUSES.includes(newStatus)) { // 대소문자 구분 없이 처리
                throw new BadRequestError({ message: `'${newStatus}'은(는) 유효하지 않은 모집 상태 값입니다. 허용되는 값: ${ALLOWED_STATUSES.join(', ')}` })
            }

            // 3. 모델 계층 호출하여 recruiting_status 업데이트
            const updatedServiceResult = await MypageModel.updateRecruitingStatus(BigInt(serviceId), newStatus)

            // 연결된 서비스가 없어서 업데이트가 이루어지지 않은 경우
            if (!updatedServiceResult) {
                throw new NotFoundError('해당 사용자와 연결된 서비스를 찾을 수 없습니다.')
            }

            // 모델에서 반환된 값을 그대로 반환
            return updatedServiceResult

        } catch (error) {
            console.error('MypageService - 모집 상태 업데이트 서비스 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            if (error.code === 'P2025') {
                throw new NotFoundError('서비스를 찾을 수 없습니다.')
            }
            throw new InternalServerError({ message: '유저 상태를 수정하는 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    static async getUserFeeds(serviceId, authenticatedUserId, limit, cursor) {
        try {
            // FeedModel에서 특정 service_id를 가진 피드를 조회하는 메서드 필요
            const feeds = await FeedModel.findFeedsByServiceId(serviceId, authenticatedUserId, limit, cursor)

            // 필요한 경우 데이터 변환 (BigInt -> Number)
            // return convertBigIntsToNumbers(feeds);
            return feeds
        } catch (error) {
            console.error('MypageService - 사용자 피드 조회 서비스 오류:', error);
            throw new InternalServerError({ message: '사용자 피드 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    static async getUserCards(serviceId) { // limit, cursor 파라미터 추가 가능
        try {
            // CardsService에서 특정 service_id를 가진 카드를 조회하는 메서드 필요
            const cards = await CardsService.getCardsByServiceId(serviceId); // limit, cursor 전달

            // 필요한 경우 데이터 변환 (BigInt -> Number)
            // return convertBigIntsToNumbers(cards);
            return cards;
        } catch (error) {
            console.error('MypageService - 사용자 카드 조회 서비스 오류:', error);
            throw new InternalServerError({ message: '사용자 이력/활동 카드 조회 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }
}



export default MypageService