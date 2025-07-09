import express from 'express'
import userController from './signUp.controller.js'

const router = express.Router()

// 회원가입
router.post('/', userController.signup)

export default router
