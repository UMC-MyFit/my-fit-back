import { UnauthorizedError } from '../../middlewares/error.js'

export const loginSuccess = (req, res) => {
    const { id, email, name } = req.user
    res.success({
        message: '로그인 성공',
        result: { service_id: id, email, name },
    })
}

export const logout = (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error)
        }
        res.success({ message: '로그아웃 성공' })
    })
}

export const checkLoginStatus = (req, res) => {
    console.log('현재 세션 정보: ', req.session)
    if (req.isAuthenticated()) {
        const { service_id, name, email } = req.user
        res.success({
            message: '로그인 상태입니다.',
            result: { service_id, name, email },
        })
    } else {
        throw new UnauthorizedError('로그인되어 있지 않습니다.')
    }
}
