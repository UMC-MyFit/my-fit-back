import MypageService from './mypage.service.js'
import { BadRequestError, NotFoundError, ForbiddenError } from '../../middlewares/error.js'

class MypageController {
    /**
     * GET /api/mypage/:service_id/profile_info 요청을 처리하여 사용자 프로필 정보를 반환합니다.
     */
    static async getUserProfileInfo(req, res, next) {
        try {
            const { service_id } = req.params

            if (!service_id || isNaN(service_id) || parseInt(service_id).toString() !== service_id.toString()) {
                throw new BadRequestError({ field: 'service_id', message: '유효한 사용자 ID가 필요합니다.' })
            }

            const userProfile = await MypageService.getUserProfileInfo(service_id)
            // console.log('사용자 프로필 정보:', userProfile)

            return res.success({
                code: 200,
                message: '사용자 프로필 정보를 성공적으로 조회했습니다.',
                result: userProfile, // 조회된 프로필 정보 포함
            })
        } catch (error) {
            // 오류 발생 시 다음 에러 핸들링 미들웨어로 전달
            console.error('사용자 프로필 정보 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * PATCH /api/mypage/profile_pic 요청을 처리하여 사용자 프로필 사진을 수정
     */
    static async updateProfilePicture(req, res, next) {
        try {
            const { profile_img } = req.body
            const service_id = req.user.service_id

            if (!profile_img || typeof profile_img !== 'string') {
                throw new BadRequestError({ field: 'profile_img', message: '유효한 프로필 사진 URL이 필요합니다.' })
            }

            const result = await MypageService.updateProfilePicture(service_id, profile_img)
            console.log('프로필 사진 업데이트 결과:', result)

            return res.success({
                code: 200,
                message: '프로필 사진이 성공적으로 수정되었습니다.',
                result: {
                    user_id: result.id,
                    profile_img: result.profile_img
                }
            })
        } catch (error) {
            console.error('사용자 프로필 사진 업데이트 중 오류:', error)
            next(error)
        }
    }

    // PUT /api/mypage/recruiting_status 요청을 처리하여 사용자 서비스의 recruiting_status를 업데이트
    static async updateRecruitingStatus(req, res, next) {
        try {
            const { recruiting_status } = req.body
            const service_id = req.user.service_id

            /* 1. 입력값 유효성 검사
            if (!serviceId || isNaN(serviceId) || String(BigInt(serviceId)) !== serviceId) {
                throw new BadRequestError({ field: 'serviceId', message: '유효한 사용자 ID가 필요합니다.' })
            } */
            if (!recruiting_status || typeof recruiting_status !== 'string' || recruiting_status.trim() === '') {
                throw new BadRequestError({ field: 'recruiting_status', message: '유효한 모집 상태 값이 필요합니다.' })
            }

            // 3. 서비스 호출
            const result = await MypageService.updateRecruitingStatus(service_id, recruiting_status)

            return res.success({
                code: 200,
                message: '서비스 모집 상태가 성공적으로 수정되었습니다.',
                result: result,
            });
        } catch (error) {
            console.error('유저의 구인/구직 상태 업데이트 중 오류:', error)
            next(error)
        }
    }

    static async getUserFeeds(req, res, next) {
        try {
            const { service_id } = req.params
            const authenticatedUserId = req.user.service_id
            const limit = parseInt(req.query.limit) || 10
            const cursor = req.query.cursor ? BigInt(req.query.cursor) : null

            if (!service_id || isNaN(service_id)) {
                throw new BadRequestError({ field: 'service_id', message: '유효한 서비스 ID가 필요합니다.' })
            }

            const feeds = await MypageService.getUserFeeds(BigInt(service_id), authenticatedUserId, limit, cursor)

            const next_cursor = feeds.length === limit ? feeds[feeds.length - 1].feed_id : null

            return res.success({
                code: 200,
                message: '사용자 피드 목록을 성공적으로 조회했습니다.',
                result: {
                    feeds,
                    pagination: {
                        next_cursor,
                        has_next: !!next_cursor
                    }
                },
            })
        } catch (error) {
            next(error)
        }
    }

    static async getUserCards(req, res, next) {
        try {
            const { service_id } = req.params
            const limit = parseInt(req.query.limit) || 10
            const cursor = req.query.cursor ? BigInt(req.query.cursor) : null

            if (!service_id || isNaN(service_id)) {
                throw new BadRequestError({ field: 'service_id', message: '유효한 서비스 ID가 필요합니다.' });
            }

            // const cards = await MypageService.getUserCards(BigInt(service_id)); 
            const cards = await MypageService.getUserCards(BigInt(service_id), limit, cursor)

            const next_cursor = cards.length === limit ? cards[cards.length - 1].id : null

            return res.success({
                code: 200,
                message: '사용자 이력/활동 카드 목록을 성공적으로 조회했습니다.',
                result: {
                    cards,
                    pagination: {
                        next_cursor,
                        has_next: !!next_cursor
                    }
                }
            })
        } catch (error) {
            next(error)
        }
    }
}

export default MypageController