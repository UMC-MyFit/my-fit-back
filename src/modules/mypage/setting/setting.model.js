import prismaPkg from '@prisma/client';
const { PrismaClient, NetworkStatus } = prismaPkg;
import { convertBigIntsToNumbers } from '../../../libs/dataTransformer.js';
const prisma = new PrismaClient();

// issue1

class SettingModel {
    static async getUserProfile(serviceId) {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                userDBs: {
                    include: {
                        user: true,
                    },
                },
                userAreas: true,
            },
        })

        const user = service.userDBs[0]?.user
        const area = service.userAreas[0]

        if (!user) return null

        return {
            nickname: user.name,
            one_line_profile: user.one_line_profile,
            age: user.birth_date,
            main_area: area?.high_area,
            sub_area: area?.low_area,
            job_status: service.recruiting_status,
            desired_sector: service.low_sector,
            highest_education: user.Highest_grade,
            graduation_status: user.grade_status,
        }
    }

    static async updateUserProfile(serviceId, data) {
        // 먼저 해당 서비스에 연결된 유저 ID를 가져옴
        const userDb = await prisma.userDB.findFirst({
            where: { service_id: serviceId },
            select: { user_id: true }
        })

        const userId = userDb.user_id

        const userUpdate = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                one_line_profile: data.one_line_profile,
                birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
                Highest_grade: data.Highest_grade,
                grade_status: data.grade_status,
                updated_at: new Date(),
            },
        })
        const userUpdateResult = convertBigIntsToNumbers(userUpdate)

        const userAreaId = await SettingModel.findUserAreaIdByServiceId(serviceId)
        const userArea = await prisma.userArea.upsert({
            where: { id: userAreaId },
            update: {
                high_area: data.high_area,
                low_area: data.low_area,
                updated_at: new Date(),
            },
            create: {
                service_id: serviceId,
                high_area: data.high_area,
                low_area: data.low_area,
            },
        })
        const userAreaResult = convertBigIntsToNumbers(userArea)

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: {
                name: data.name,
                recruiting_status: data.recruiting_status,
                low_sector: data.low_sector,
                updated_at: new Date(),
            },
        })
        const serviceResult = convertBigIntsToNumbers(service)

        return { userUpdateResult, userAreaResult, serviceResult }
    }

    static async findUserIdeByServiceId(serviceId) {
        const userDb = await prisma.userDB.findFirst({
            where: { service_id: serviceId },
            select: { user_id: true }
        })
        return userDb ? userDb.user_id : null
    }

    static async findUserAreaIdByServiceId(serviceId) {
        const userArea = await prisma.userArea.findFirst({
            where: { service_id: serviceId },
            select: {
                id: true,
            }
        })
        return userArea ? userArea.id : null
    }

    static async getTeamProfile(serviceId) {

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                userDBs: {
                    include: {
                        user: true,
                    },
                },
                userAreas: true,
            },
        })

        const user = service.userDBs[0]?.user
        const area = service.userAreas[0]

        if (!user) return null

        return {
            name: user.name,
            one_line_profile: user.one_line_profile,
            team_division: user.team_division,
            industry: user.industry,
            high_area: area?.high_area,
            low_area: area?.low_area,
            recruiting_status: service.recruiting_status,
            link: user.link,
        }
    }

    static async updateTeamProfile(userId, serviceId, data) {
        const userUpdate = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                one_line_profile: data.one_line_profile,
                team_division: data.team_division,
                industry: data.industry,
                link: data.link,
                updated_at: new Date(),
            },
        })
        const userUpdateResult = convertBigIntsToNumbers(userUpdate)

        const userAreaId = await SettingModel.findUserAreaIdByServiceId(serviceId)
        const userArea = await prisma.userArea.upsert({
            where: { id: userAreaId },
            update: {
                high_area: data.high_area,
                low_area: data.low_area,
                updated_at: new Date(),
            },
            create: {
                service_id: serviceId,
                high_area: data.high_area,
                low_area: data.low_area,
            },
        })
        const userAreaResult = convertBigIntsToNumbers(userArea)

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: {
                name: data.name,
                recruiting_status: data.recruiting_status,
                low_sector: data.team_division,
                updated_at: new Date(),
            },
        })
        const serviceResult = convertBigIntsToNumbers(service)

        return { userUpdateResult, userAreaResult, serviceResult }
    }
}

export default SettingModel