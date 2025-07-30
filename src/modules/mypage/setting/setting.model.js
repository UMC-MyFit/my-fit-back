import prismaPkg from '@prisma/client';
const { PrismaClient, NetworkStatus } = prismaPkg;
import { convertBigIntsToNumbers } from '../../../libs/dataTransformer.js';
const prisma = new PrismaClient();

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
                name: data.nickname,
                one_line_profile: data.one_line_profile,
                birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
                Highest_grade: data.highest_education,
                grade_status: data.graduation_status,
            },
        })
        const userUpdateResult = convertBigIntsToNumbers(userUpdate)

        const userArea = await prisma.userArea.upsert({
            where: { id: serviceId },
            update: {
                high_area: data.main_area,
                low_area: data.sub_area,
            },
            create: {
                service_id: serviceId,
                high_area: data.main_area,
                low_area: data.sub_area,
            },
        })
        const userAreaResult = convertBigIntsToNumbers(userArea)

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: {
                recruiting_status: data.job_status,
                low_sector: data.desired_sector,
            },
        })
        const serviceResult = convertBigIntsToNumbers(service)

        return { userUpdateResult, userAreaResult, serviceResult }
    }
}

export default SettingModel