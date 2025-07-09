import usersService from './signUp.service.js'

const userController = {
    // 회원가입
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
}

export default userController
