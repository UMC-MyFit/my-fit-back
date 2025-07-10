// 라우터 통합
import express from 'express'
import signUpRouter from '../modules/signUp/signUp.routes.js'
import cardsRouter from '../modules/cards/cards.routes.js'
import userRouter from '../modules/user/user.routes.js'
const router = express.Router()

// 회원가입
router.use('/users', signUpRouter)

// 이력/활동 카드
router.use('/cards', cardsRouter)

// 유저 정보
router.use('/users', userRouter)

export default router
