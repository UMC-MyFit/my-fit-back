import SettingModel from './setting.model.js'
import { NotFoundError, InternalServerError, BadRequestError, CustomError } from '../../../middlewares/error.js'
class SettingService {
    static async getUserProfile(serviceId) {
        try {
            return await SettingModel.getUserProfile(serviceId)
        } catch (error) {
            console.error('SettingService - 프로필 조회 오류:', error)
            throw new InternalServerError({ message: '프로필 조회 중 오류가 발생했습니다.' })
        }
    }

    static async updateUserProfile(userId, profileData) {
        try {
            return await SettingModel.updateUserProfile(userId, profileData)
        } catch (error) {
            console.error('SettingService - 프로필 수정 오류:', error)
            throw new InternalServerError({ message: '프로필 수정 중 오류가 발생했습니다.' })
        }
    }

    static async getTeamProfile(serviceId) {
        try {
            const result = await SettingModel.getTeamProfile(serviceId)
            if (!result) {
                throw new NotFoundError({ message: '팀 정보가 없습니다.' })
            }
            return result;
        } catch (error) {
            console.error('SettingService - 팀 프로필 조회 오류:', error)
            throw new InternalServerError({ message: '팀 프로필 조회 중 오류가 발생했습니다.' })
        }
    }

    static async updateTeamProfile(serviceId, data) {
        try {
            const userId = await SettingModel.findUserIdeByServiceId(serviceId)
            if (!userId) {
                throw new NotFoundError({ message: '해당 서비스에 연결된 유저가 없습니다.' })
            }

            return await SettingModel.updateTeamProfile(userId, serviceId, data)
        } catch (error) {
            console.error('SettingService - 팀 프로필 수정 오류:', error)
            throw new InternalServerError({ message: '팀 프로필 수정 중 오류가 발생했습니다.' })
        }
    }

}

export default SettingService