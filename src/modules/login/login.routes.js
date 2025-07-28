import express from 'express'
import passport from 'passport'
import { logout, checkLoginStatus } from './login.controller.js'

const router = express.Router()

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 이메일과 비밀번호로 사용자를 로그인합니다.
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: chulsoo@naver.com
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 로그인 성공
 *               result:
 *                 service_id: 2
 *                 email: chulsoo@naver.com
 *                 name: 김철수
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             example:
 *               UserNotFound:
 *                 summary: 로그인 실패
 *                 value:
 *                   isSuccess: false
 *                   code: 401
 *                   message: 로그인에 실패하였습니다. 이메일이나 비밀번호를 확인해주세요.
 *                   result: null
 *             
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버에 오류가 발생하였습니다.
 *               result: null
 */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) return next(error)
        if (!user) {
            return res.status(401).json({
                isSuccess: false,
                code: 401,
                message: info?.message || '로그인 실패',
                result: null,
            })
        }

        req.logIn(user, (error) => {
            if (error) return next(error)
            const { email, name } = user
            const service_id = user.userDBs?.[0]?.service?.id
            res.success({
                message: '로그인 성공',
                result: { service_id, email, name },
            })
        })
    })(req, res, next)
})

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     description: 현재 로그인된 사용자를 로그아웃합니다.
 *     tags:
 *       - Login
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 로그아웃 성공
 *               result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버에 오류가 발생하였습니다
 *               result: null
 */
router.post('/logout', logout)

/**
 * @swagger
 * /api/users/check:
 *   get:
 *     summary: 로그인 상태 확인
 *     description: 현재 로그인된 사용자인지 확인합니다.
 *     tags:
 *       - Login
 *     responses:
 *       200:
 *         description: 로그인 상태임
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: true
 *               code: 200
 *               message: 로그인 상태입니다.
 *               result:
 *                 service_id: 2
 *                 name: 김철수
 *       401:
 *         description: 로그인되어 있지 않음
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 401
 *               message: 로그인이 필요한 요청입니다.
 *               result: null
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               isSuccess: false
 *               code: 500
 *               message: 서버에 오류가 발생하였습니다.
 *               result: null
 */
router.get('/check', checkLoginStatus)

//구글 로그인 요청
router.get(
    '/oauth/google',
    passport.authenticate('google', {
        scope: ['email'],
    })
)

// TODO 프론트랑 연결하고 리다이렉션 진행
// Google 콜백
router.get(
    '/oauth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user) {
            const { email, platform } = req.authInfo
            req.session.tempOAuthUser = { email, platform }
            return res.redirect('/signup/detail') // 프론트한테 route 물어봐야 함
        }
        // 로그인 성공
        return res.redirect('/')
    }
)

// 카카오 로그인 요청
router.get('/oauth/kakao', passport.authenticate('kakao'))

// TODO 프론트랑 연결하고 리다이렉션 진행
// 카카오 콜백 처리
router.get(
    '/oauth/kakao/callback',
    passport.authenticate('kakao', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user) {
            const { email, platform } = req.authInfo
            req.session.tempOAuthUser = { email, platform }
            return res.redirect('/signup/detail')
        }
        return res.redirect('/')
    }
)

// 네이버 로그인 요청
router.get('/oauth/naver', passport.authenticate('naver', { scope: ['email'] }))

// TODO 프론트랑 연결하고 리다이렉션 진행
// 네이버 콜백 처리
router.get(
    '/oauth/naver/callback',
    passport.authenticate('naver', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user) {
            const { email, platform } = req.authInfo
            req.session.tempOAuthUser = { email, platform }
            return res.redirect('/signup/detail')
        }
        return res.redirect('/')
    }
)

export default router
