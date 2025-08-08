import SettingService from './setting.service.js'
import { BadRequestError } from '../../../middlewares/error.js'


class SettingController {
    static async getProfile(req, res, next) {
        try {
            const serviceId = req.user.service_id
            const profile = await SettingService.getUserProfile(serviceId)
            return res.success({
                code: 200,
                message: '프로필 정보를 성공적으로 조회했습니다.',
                result: profile,
            })
        } catch (error) {
            next(error)
        }
    }

    static async getTeamProfile(req, res, next) {
        try {
            const serviceId = req.user.service_id
            const profile = await SettingService.getTeamProfile(serviceId)
            if (!profile) {
                throw new BadRequestError({ message: '팀 프로필을 찾을 수 없습니다.' })
            }
            return res.success({
                code: 200,
                message: '팀 프로필 정보를 성공적으로 조회했습니다.',
                result: profile,
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const serviceId = BigInt(req.user.service_id)
            const profileData = req.body

            if (!profileData) {
                throw new BadRequestError({ message: '프로필 수정 정보가 필요합니다.' })
            }

            const updated = await SettingService.updateUserProfile(serviceId, profileData)
            return res.success({
                code: 200,
                message: '프로필 정보를 성공적으로 수정했습니다.',
                result: updated,
            })
        } catch (error) {
            console.error('SettingController - 프로필 수정 중 오류:', error)
            next(error)
        }
    }

    static async updateTeamProfile(req, res, next) {
        try {
            const serviceId = BigInt(req.user.service_id)
            const data = req.body

            if (!data) {
                throw new BadRequestError({ message: '팀 프로필 수정 정보가 필요합니다.' })
            }

            const updated = await SettingService.updateTeamProfile(serviceId, data)
            return res.success({
                code: 200,
                message: '팀 프로필 정보를 성공적으로 수정했습니다.',
                result: updated,
            })
        } catch (error) {
            console.error('SettingController - 팀 프로필 수정 중 오류:', error)
            next(error)
        }
    }
}

export default SettingController


