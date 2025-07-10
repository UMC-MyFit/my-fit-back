import usersService from './user.service.js'
import { UnauthorizedError } from '../../middlewares/error.js'
const usersController = {
    updateBusinessLicense: async (req, res, next) => {
        try {
            // const userId = req.session.user?.service_id; 이렇게 수정 예정
            const userId = req.body.service_id
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
}

export default usersController
