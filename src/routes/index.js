// 라우터 통합
import express from 'express'
import signUpRouter from '../modules/signUp/signUp.routes.js'
import loginRouter from '../modules/login/login.routes.js'
import cardsRouter from '../modules/cards/cards.routes.js'
import userRouter from '../modules/user/user.routes.js'
import recruitmentRouter from '../modules/recruitments/recruitments.routes.js'
import feedsRouter from '../modules/feed/feed.routes.js'
const router = express.Router()

// 회원가입
router.use('/users', signUpRouter)

// 로그인
router.use('/users', loginRouter)

// 피드, 댓글
router.use('/feeds', feedsRouter)

// 이력/활동 카드
router.use('/cards', cardsRouter)

// 유저 정보
router.use('/users', userRouter)

// 구인 공고
router.use('/recruitments', recruitmentRouter)
export default router
