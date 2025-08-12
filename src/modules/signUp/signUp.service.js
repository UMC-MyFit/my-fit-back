import { PrismaClient } from '@prisma/client'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import redisClient from '../../libs/redisClient.js'

const prisma = new PrismaClient()

import UserModel from './signUp.model.js'
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
} from '../../middlewares/error.js'
import { generateAuthCode, sendAuthCodeEmail } from '../../libs/auth.utils.js'

const usersService = {
    // 회원가입(일반)
    signup: async ({
        email,
        password,
        division,
        name,
        one_line_profile,
        birth_date,
        high_area,
        low_area,
        recruiting_status,
        high_sector,
        low_sector,
        Highest_grade,
        grade_status,
    }) => {
        console.log('service 진입')

        // 0. 이전에 is_profile_completed: false로 가입한 유저가 있다면 삭제
        try {
            const incompleteUser = await prisma.user.findFirst({
                where: { email, is_profile_completed: false },
            })

            if (incompleteUser) {
                console.log(
                    `기존 is_completed: false 유저(id: ${incompleteUser.id}) 삭제 중`
                )

                const relatedServices = await prisma.userDB.findMany({
                    where: { user_id: incompleteUser.id },
                    select: { service_id: true },
                })
                const serviceIds = relatedServices.map((s) => s.service_id)

                await prisma.userArea.deleteMany({
                    where: { service_id: { in: serviceIds } },
                })

                await prisma.userDB.deleteMany({
                    where: { user_id: incompleteUser.id },
                })

                await prisma.service.deleteMany({
                    where: { id: { in: serviceIds } },
                })

                await prisma.user.delete({
                    where: { id: incompleteUser.id },
                })
            }
        } catch (error) {
            console.error('이전 미완료 유저 삭제 중 오류 발생:', error.message)
        }

        // 1. 이메일 중복 검사
        const existingUser = await prisma.user.findFirst({
            where: { email, is_profile_completed: true },
        })
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
                Highest_grade,
                grade_status,
            },
        })
        console.log('User 생성 완료')

        // 3. Service 생성
        const newService = await prisma.service.create({
            data: {
                name,
                high_sector,
                low_sector,
                recruiting_status,
                profile_img: 'https://myfit-bucket-mhfd.s3.ap-northeast-2.amazonaws.com/userProfile/base_prifile4.svg',
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
                high_area,
                low_area,
            },
        })
        console.log('UserArea 생성 완료')

        return convertBigIntsToNumbers({
            user_id: newUser.id,
            service_id: newService.id,
            email: newUser.email,
        })
    },

    singupTeam: async ({
        email,
        password,
        name,
        one_line_profile,
        division,
        team_division,
        industry,
        link,
        high_area,
        low_area,
        recruiting_status,
    }) => {
        // 0. 이전에 is_profile_completed: false로 가입한 유저가 있다면 삭제
        try {
            const incompleteUser = await prisma.user.findFirst({
                where: { email, is_profile_completed: false },
            })

            if (incompleteUser) {
                console.log(`기존 is_completed: false 유저(id: ${incompleteUser.id}) 삭제 중`)

                const relatedServices = await prisma.userDB.findMany({
                    where: { user_id: incompleteUser.id },
                    select: { service_id: true },
                })
                const serviceIds = relatedServices.map((s) => s.service_id)

                await prisma.userArea.deleteMany({
                    where: { service_id: { in: serviceIds } }
                })

                await prisma.userDB.deleteMany({
                    where: { user_id: incompleteUser.id }
                })

                await prisma.service.deleteMany({
                    where: { id: { in: serviceIds } }
                })

                await prisma.user.delete({
                    where: { id: incompleteUser.id },
                })
            }


        } catch (error) {
            console.error('이전 미완료 유저 삭제 중 오류 발생', error.message)
        }

        // 1. 이메일 중복 확인
        const existingUser = await prisma.user.findFirst({
            where: { email, is_profile_completed: true },
        })
        if (existingUser) {
            throw new ConflictError({ message: '이미 존재하는 이메일입니다.' })
        }

        // 2. 유저 생성
        const newUser = await prisma.user.create({
            data: {
                email,
                password,
                name,
                one_line_profile,
                birth_date: new Date(),
                division,
                team_division,
                industry,
                link,
            }
        })

        console.log('User 생성 완료')

        // 3. 서비스 생성
        const newService = await prisma.service.create({
            data: {
                name,
                high_sector: '',
                low_sector: '',
                recruiting_status,
                profile_img: 'https://myfit-bucket-mhfd.s3.ap-northeast-2.amazonaws.com/userProfile/base_prifile4.svg',
            }
        })

        console.log('Service 생성 완료')

        // 4. UserDB 생성
        await prisma.userDB.create({
            data: {
                user_id: newUser.id,
                service_id: newService.id,
            }
        })

        console.log('UserDB 생성 완료')

        // 5. UserArea 생성
        await prisma.userArea.create({
            data: {
                service_id: newService.id,
                high_area,
                low_area
            }
        })

        console.log('UserArea 생성 완료')

        return convertBigIntsToNumbers({
            user_id: newUser.id,
            service_id: newService.id,
            email: newUser.email,
        })

    },

    sendAuthCodeEmail: async ({ email }) => {
        // Redis 연결
        if (!redisClient.isOpen) {
            try {
                await redisClient.connect()
            } catch (error) {
                console.error('Redis 연결 실패:', error)
                throw new InternalServerError('Redis 연결 실패')
            }
        }
        const authCode = generateAuthCode()
        console.log('인증코드:', authCode)

        // 이메일로 인증코드 전송
        await sendAuthCodeEmail(email, authCode)
        console.log('보내기 성공')

        try {
            // Redis에 인증코드 저장
            await redisClient.set(`authCode:${email}`, authCode, {
                EX: 180, // 유효시간 3분(180초)
            })
        } catch (error) {
            console.log('redis 연결 실패')
        }

        return authCode
    },
}

export default usersService
