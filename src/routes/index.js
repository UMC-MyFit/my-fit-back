// 라우터 통합
import express from 'express'
import signUpRouter from '../modules/signUp/signUp.routes.js'
const router = express.Router()

// 회원가입 (POST)
router.use('/users', signUpRouter)

export default router
