import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'

const prisma = new PrismaClient()

const loginModel = {
    // 이메일로 사용자 조회
    findByEmail: async (email) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            })
            return user ? convertBigIntsToNumbers(user) : null
        } catch (error) {
            console.log('로그인 중 이메일 조회 오류', error)
            throw error
        }
    },

    // 사용자 ID로 조회 (deserializeUser용)
    findById: async (id) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            })
            return user ? convertBigIntsToNumbers(user) : null
        } catch (error) {
            console.error('ID로 사용자 조회 오류:', error)
            throw error
        }
    },
}

export default loginModel
