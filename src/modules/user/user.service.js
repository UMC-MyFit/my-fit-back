import { Prisma, PrismaClient } from '@prisma/client'
import redisClient from '../../libs/redisClient.js'
import {
    BadRequestError,
    ConflictError,
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
        if (user.division !== 'team') {
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

    resetPassword: async ({ email, authCode, newPassword }) => {
        // 1. 이메일 존재 여부 확인
        const user = await prisma.user.findFirst({
            where: {
                email,
                platform: 'local',
            },
        })
        if (!user) {
            const otherPlatformUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: {
                        platform: 'local'
                    }
                }
            })
            if (otherPlatformUser) {
                throw new ConflictError('소셜 로그인으로 가입된 회원은 비밀번호 재설정이 불가능합니다.')
            }
            throw new NotFoundError('가입되지 않은 이메일입니다.')
        }

        // 2. Redis에서 이메일 인증 코드 확인
        const storedCode = await redisClient.get(`authCode:${email}`)
        if (!storedCode || storedCode !== authCode) {
            throw new BadRequestError('인증코드가 유효하지 않습니다.')
        }

        // 3. 비밀번호 유효성 검사
        if (newPassword.length < 6) {
            throw new BadRequestError('비밀번호는 최소 6자 이상이어야 합니다.')
        }

        // 4. 비밀번호 재설정 (나중에 bcrpt 적용 예정)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPassword },
        })

        // 5. Redis에서 인증번호 삭제
        await redisClient.del(`authCode:${email}`)
    },

    verifyCode: async (email, authCode) => {
        const storedCode = await redisClient.get(`authCode:${email}`)
        console.log(`storedCode: ${storedCode}, inputCode: ${authCode}`)
        if (!storedCode || storedCode !== authCode) {
            throw new BadRequestError('인증코드가 유효하지 않습니다.')
        }
    },
}

export default usersService
