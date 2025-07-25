import usersService from './signUp.service.js'
import {
    InternalServerError,
    BadRequestError,
} from '../../middlewares/error.js'
import { sendAuthCodeEmail } from '../../libs/auth.utils.js'
const userController = {
    // 회원가입(개인)
    signup: async (req, res, next) => {
        console.log('controller 진입')
        try {
            const userData = req.body
            const result = await usersService.signup(userData)
            console.log('result:', result)
            res.success({
                code: 201,
                message: '회원가입 성공',
                result,
            })
        } catch (err) {
            console.log('여기서 에러')
            next(err) // 에러 미들웨어로 전달
        }
    },
    // 회원가입(팀)
    singupTeam: async (req, res, next) => {
        try {
            const userData = req.body;

            const result = await usersService.singupTeam(userData);
            res.success({
                code: 201,
                message: '팀 회원가입 성공',
                result,
            })
        } catch (error) {
            next(error)
        }
    },
    sendAuthCode: async (req, res, next) => {
        try {
            const { email } = req.body

            if (!email) {
                throw new BadRequestError('이메일이 필요합니다.')
            }
            const authCode = await usersService.sendAuthCodeEmail({ email })

            res.success({
                code: 200,
                message: '인증코드 전송 완료',
                result: { authCode },
            })
        } catch (error) {
            throw new InternalServerError('인증코드 전송 중 오류 발생')
        }
    },
}

export default userController
