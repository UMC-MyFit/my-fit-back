import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt' // 비밀번호 암호화 시 사용 예정
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }),
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) {
                return done(null, false, {
                    message: '존재하지 않는 사용자입니다.',
                })
            }

            // 비밀번호 평문으로 저장할 때만 사용
            if (user.password !== password) {
                return done(null, false, {
                    message: '비밀번호가 일치하지 않습니다.',
                })
            }

            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }
)

// 세션에 사용자 id 저장(로그인 성공 시)
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// 로그인 상태 확인 (매 요청마다 올바르게 로그인 되어있나 확인하고, 해당 사용자의 정보를 req.user에 넣어줌)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        done(null, user)
    } catch (error) {
        done(error)
    }
})
