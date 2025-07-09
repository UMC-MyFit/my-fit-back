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

    // 사용자 생성
    // signUp.model.js

    create: async ({
        email,
        password,
        name,
        one_line_profile,
        birth_date,
        division,
        grade_status,
        high_area_id,
        low_area_id,
        recruiting_status,
        sector,
    }) => {
        try {
            // 1. User 생성
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password,
                    name,
                    one_line_profile,
                    birth_date: new Date(birth_date),
                    division,
                    grade_status,
                },
            })

            // 2. Service 생성
            const newService = await prisma.service.create({
                data: {
                    name,
                    sector,
                    recruiting_status,
                    profile_img: '', // 기본 이미지나 빈 문자열
                },
            })

            // 3. UserDB 생성 (User ↔ Service 연결)
            await prisma.userDB.create({
                data: {
                    user_id: newUser.id,
                    service_id: newService.id,
                },
            })

            // 4. UserArea 생성 (Service ↔ 활동지역 연결)
            await prisma.userArea.create({
                data: {
                    service_id: newService.id,
                    high_area_id,
                    low_area_id,
                },
            })

            return convertBigIntsToNumbers({
                user_id: newUser.id,
                service_id: newService.id,
                email: newUser.email,
                name: newUser.name,
            })
        } catch (error) {
            console.error('회원가입 유저 생성 오류:', error)
            throw error
        }
    },
}

export default signUpModel
