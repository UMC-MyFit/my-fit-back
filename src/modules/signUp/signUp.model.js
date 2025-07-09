import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'

const prisma = new PrismaClient()

const signUpModel = {
    // 이메일로 사용자 존재 여부 확인
    findByEmail: async (email) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            })
            return user ? convertBigIntsToNumbers(user) : null
        } catch (error) {
            console.error('이메일 중복 확인 오류:', error)
            throw error
        }
    },
}

export default signUpModel
