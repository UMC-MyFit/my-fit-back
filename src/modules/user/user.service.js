import { Prisma, PrismaClient } from '@prisma/client'
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'

const prisma = new PrismaClient()

const usersService = {
    updateBusinessLicense: async (userId, inc_AuthN_file) => {
        // 1. 유저 존재 확인
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new NotFoundError({ message: '유저를 찾을 수 없습니다.' })
        }

        // 2. 기업 회원인지 확인
        if (user.division !== 'business') {
            throw new BadRequestError({
                message: '사업자 등록증은 기업 회원만 등록할 수 있습니다.',
            })
        }

        // 3. inc_AuthN_file 업데이트
        await prisma.user.update({
            where: { id: userId },
            data: { inc_AuthN_file },
        })

        // 4. userDB 조회
        const userDB = await prisma.userDB.findFirst({
            where: { user_id: userId },
        })

        if (!userDB) {
            throw new NotFoundError({
                message: '해당 유저의 userDB가 존재하지 않습니다.',
            })
        }

        // 5. 해당 유저의 is_inc_AuthN을 true로 변경
        await prisma.service.update({
            where: { id: userDB.service_id },
            data: { is_inc_AuthN: true },
        })

        return convertBigIntsToNumbers({
            service_id: userId,
            inc_AuthN_file,
        })
    },
}

export default usersService
