// 라우터 통합
import express from 'express'
import signUpRouter from '../modules/signUp/signUp.routes.js'
import cardsRouter from '../modules/cards/cards.routes.js'
const router = express.Router()

// 회원가입
router.use('/users', signUpRouter)

// 이력/활동 카드
router.use('/cards', cardsRouter)
export default router
