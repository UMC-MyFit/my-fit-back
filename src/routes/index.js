// 라우터 통합
import express from 'express'
import passport from 'passport'

import signUpRouter from '../modules/signUp/signUp.routes.js'
import loginRouter from '../modules/login/login.routes.js'
import cardsRouter from '../modules/cards/cards.routes.js'
import userRouter from '../modules/user/user.routes.js'
import recruitmentRouter from '../modules/recruitments/recruitments.routes.js'
import feedsRouter from '../modules/feed/feed.routes.js'
import mypageRouter from '../modules/mypage/mypage.routes.js'
import chattingRouter from '../modules/chatting/chatting.routes.js'
import coffeechatRouter from '../modules/coffeechat/coffeechat.routes.js'
import relationshipsRouter from '../modules/relationships/relationships.routes.js'
import settingRouter from '../modules/mypage/setting/setting.routes.js'
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

// 마이페이지
router.use('/mypage', mypageRouter)

// 채팅
router.use('/chatting-rooms', chattingRouter)

// 커피챗
router.use('/chatting-rooms', coffeechatRouter)

// 관계 설정 (관심, 네트워크, 차단 등)
router.use('/relationships', relationshipsRouter)

// 마이페이지 설정
router.use('/settings', settingRouter)

export default router
