import usersService from './user.service.js'
import {
    BadRequestError,
    UnauthorizedError,
    InternalServerError,
} from '../../middlewares/error.js'
import redisClient from '../../libs/redisClient.js'
const usersController = {
    updateBusinessLicense: async (req, res, next) => {
        try {
            const serviceId = req.user.service_id
            if (!serviceId) {
                throw new UnauthorizedError()
            }


            const { inc_AuthN_file } = req.body
            const result = await usersService.updateBusinessLicense(
                serviceId,
                inc_AuthN_file
            )

            res.success({
                code: 200,
                message: '사업자 등록증 등록/수정 성공',
                result,
            })
        } catch (error) {
            next(error)
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            // Redis 연결
            if (!redisClient.isOpen) {
                try {
                    await redisClient.connect()
                } catch (error) {
                    console.error('Redis 연결 실패:', error)
                    throw new InternalServerError('Redis 연결 실패')
                }
            }
            const { email, authCode, newPassword } = req.body

            if (!email || !authCode || !newPassword) {
                throw new BadRequestError(
                    '이메일, 인증코드, 새 비밀번호는 필수입니다.'
                )
            }

            await usersService.resetPassword({ email, authCode, newPassword })

            res.success({
                code: 200,
                message: '비밀번호가 성공적으로 변경되었습니다.',
                result: null,
            })
        } catch (error) {
            next(error)
        }
    },
    verifyCode: async (req, res, next) => {
        try {
            // Redis 연결
            if (!redisClient.isOpen) {
                try {
                    await redisClient.connect()
                } catch (error) {
                    console.error('Redis 연결 실패:', error)
                    throw new InternalServerError('Redis 연결 실패')
                }
            }
            const { email, authCode } = req.body
            if (!email || !authCode) {
                throw new BadRequestError(
                    '이메일과 인증코드를 모두 입력해주세요'
                )
            }

            await usersService.verifyCode(email, authCode)

            res.success({
                code: 200,
                message: '인증코드가 유효합니다.',
                result: null,
            })
        } catch (error) {
            next(error)
        }
    },
    verifyUser: async (req, res, next) => {
        try {
            const { email, password, authCode } = req.body
            if (!email || !password || !authCode) {
                throw new BadRequestError('이메일, 비밀번호, 인증코드를 모두 입력해주세요')
            }

            await usersService.verifyUser(email, password, authCode)

            res.success({
                code: 200,
                message: '이메일과 비밀번호 유효성 확인을 완료하였습니다.',
                result: null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default usersController
