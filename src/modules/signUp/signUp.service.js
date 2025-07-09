import { PrismaClient } from '@prisma/client'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
const prisma = new PrismaClient()

import UserModel from './signUp.model.js'
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
} from '../../middlewares/error.js'

const usersService = {
    signup: async ({
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
        console.log('service 진입')
        // 1. 이메일 중복 검사
        const existingUser = await UserModel.findByEmail(email)
        if (existingUser)
            throw new ConflictError({ message: '이미 존재하는 이메일입니다.' })

        console.log('이메일 중복 검사 완료')
        // 2. User 생성

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
        console.log('User 생성 완료')

        // 3. Service 생성
        const newService = await prisma.service.create({
            data: {
                name,
                sector,
                recruiting_status,
                profile_img: '', // 일단 빈 문자열
            },
        })
        console.log('Service 생성 완료')

        // 4. UserDB 생성 (User와 Service 연결)

        await prisma.userDB.create({
            data: {
                user_id: newUser.id,
                service_id: newService.id,
            },
        })
        console.log('UserDB 생성 완료')

        // 5. UserArea 생성 (Service와 활동지역 연결)

        await prisma.userArea.create({
            data: {
                service_id: newService.id,
                high_area_id,
                low_area_id,
            },
        })
        console.log('UserArea 생성 완료')

        return convertBigIntsToNumbers({
            user_id: newUser.id,
            service_id: newService.id,
            email: newUser.email,
        })
    },
}

export default usersService
