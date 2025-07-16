import passport from 'passport'
import pkg from 'passport-kakao'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as NaverStrategy } from 'passport-naver'
import bcrypt from 'bcrypt' // 비밀번호 암호화 시 사용 예정
import { PrismaClient } from '@prisma/client'
import loginService from '../modules/login/login.service.js'
import { convertBigIntsToNumbers } from '../libs/dataTransformer.js'

const prisma = new PrismaClient()

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await loginService.login(email, password, 'local')
                return done(null, user)
            } catch (error) {
                return done(null, false, { message: error.message })
            }
        }
    )
)

// 세션에 사용자 id 저장(로그인 성공 시)
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// 로그인 상태 확인 (매 요청마다 올바르게 로그인 되어있나 확인하고, 해당 사용자의 정보를 req.user에 넣어줌)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: BigInt(id) } })
        const safeUser = convertBigIntsToNumbers(user)
        // 세션에 저장되는 사용자 서비스 id, 이메일, 이름
        const userForSession = {
            service_id: safeUser.id,
            email: safeUser.email,
            name: safeUser.name,
        }

        done(null, userForSession)
    } catch (error) {
        done(error)
    }
})

export const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
        clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['email'],
        state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value
        const platform = 'google'
        if (!email) return done(new Error('이메일 정보 없음'))

        const user = await prisma.user.findUnique({
            where: {
                email_platform: { email, platform },
            },
        })

        if (user) {
            return done(null, user) // 로그인
        } else {
            // 회원가입 아직 안 된 상태
            return done(null, false, {
                email,
                platform,
            })
        }
    }
)

passport.use(googleStrategy)

const KakaoStrategy = pkg.Strategy

passport.use(
    new KakaoStrategy(
        {
            clientID: process.env.PASSPORT_KAKAO_CLIENT_ID,
            clientSecret: process.env.PASSPORT_KAKAO_CLIENT_SECRET,
            callbackURL: process.env.KAKAO_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile._json?.kakao_account?.email
                const platform = 'kakao'

                if (!email)
                    return done(new Error('이메일 정보를 가져올 수 없습니다.'))

                const user = await prisma.user.findUnique({
                    where: { email_platform: { email, platform } },
                })

                if (user) return done(null, user)
                else return done(null, false, { email, platform })
            } catch (err) {
                return done(err)
            }
        }
    )
)

passport.use(
    new NaverStrategy(
        {
            clientID: process.env.PASSPORT_NAVER_CLIENT_ID,
            clientSecret: process.env.PASSPORT_NAVER_CLIENT_SECRET,
            callbackURL: process.env.NAVER_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email || profile._json?.email
                const platform = 'naver'

                if (!email)
                    return done(new Error('이메일 정보를 가져올 수 없습니다.'))

                const user = await prisma.user.findUnique({
                    where: { email_platform: { email, platform } },
                })

                if (user) return done(null, user)
                else return done(null, false, { email, platform }) // 회원가입 아직 안 된 상태
            } catch (err) {
                return done(err)
            }
        }
    )
)
