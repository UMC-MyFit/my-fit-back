import { UnauthorizedError } from './error'

export const isAuthenticated = (req, res, next) => {
    // 로그인 인증 성공
    if (req.isAuthenticated()) {
        return next()
    }

    // 로그인 인증 실패
    throw new UnauthorizedError({ message: '로그인이 필요한 요청입니다.' })
}
