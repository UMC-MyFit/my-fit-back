import usersService from './user.service.js'
import { BadRequestError, UnauthorizedError } from '../../middlewares/error.js'
const usersController = {
    updateBusinessLicense: async (req, res, next) => {
        try {
            const userId = req.user.service_id
            if (!userId) {
                throw new UnauthorizedError()
            }

            const { inc_AuthN_file } = req.body
            const result = await usersService.updateBusinessLicense(
                userId,
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
}

export default usersController
