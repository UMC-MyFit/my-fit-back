import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import { NotFoundError, InternalServerError } from '../../middlewares/error.js'

const recruitmentService = {
    createRecruitment: async (
        serviceId,
        {
            title,
            high_sector,
            low_sector,
            require,
            salary,
            work_type,
            dead_line,
            recruiting_img,
            area
        }
    ) => {
        try {
            // 0. 해당 지역 ID들이 유효한지 확인
            // const highArea = await prisma.highArea.findUnique({
            //     where: { id: high_area_id },
            // })

            // if (!highArea) {
            //     throw new NotFoundError({
            //         message: '존재하지 않는 상위 지역입니다.',
            //     })
            // }

            // const lowArea = await prisma.lowArea.findUnique({
            //     where: { id: low_area_id },
            // })

            // if (!lowArea) {
            //     throw new NotFoundError({
            //         message: '존재하지 않는 하위 지역입니다.',
            //     })
            // }
            // 1. 해당 serviceId가 존재하는지 확인
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
            })
            if (!service) {
                const err = new NotFoundError({
                    message: '존재하지 않는 사용자입니다.',
                })
                console.log('생성한 에러:', err.constructor.name)
                throw err
            }
            console.log('유저 발견')

            // 2. 공고 생성
            const newRecruitment = await prisma.recruitingNotice.create({
                data: {
                    title,
                    high_sector,
                    low_sector,
                    require,
                    salary,
                    work_type,
                    dead_line: new Date(dead_line),
                    recruiting_img,
                    service_id: serviceId,
                    area: area
                },
            })
            console.log('공고 생성 완료')

            // 3. 활동지역 생성
            // await prisma.recruitingArea.create({
            //     data: {
            //         recruiting_id: newRecruitment.id,
            //         high_area_id,
            //         low_area_id,
            //     },
            // })

            //console.log('활동 지역 생성 완료')

            return convertBigIntsToNumbers({
                recruiting_id: newRecruitment.id,
                title: newRecruitment.title,
                service_id: newRecruitment.service_id,
            })
        } catch (error) {
            console.log('구인 공고 등록 실패:', error)
            if (
                error instanceof NotFoundError ||
                error.name === 'CustomError'
            ) {
                throw error
            }

            throw new InternalServerError({
                message: '구인 공고 등록 중 서버 오류가 발생했습니다',
            })
        }
    },
    getAllRecruitment: async (highSector, lowSector = null, lastRecruimentId = null, limit = 10) => {
        try {
            const findAllRecruimentQueryOptions = {
                where: {
                    high_sector: String(highSector),
                    low_sector: lowSector !== null ? String(lowSector) : undefined
                },
                select: {
                    id: true,
                    title: true,
                    require: true,
                    low_sector: true,
                    work_type: true,
                    dead_line: true,
                    service: {
                        select: {
                            id: true,
                            name: true,
                            profile_img: true
                        }
                    }
                },
                orderBy: [
                    { id: 'desc' }
                ],
                take: limit,
            }

            // 페이지네이션
            if (lastRecruimentId !== null) {
                findAllRecruimentQueryOptions.cursor = { id: BigInt(lastRecruimentId) };
                findAllRecruimentQueryOptions.skip = 1;
            }

            const recruitments = await prisma.RecruitingNotice.findMany(findAllRecruimentQueryOptions);
            const processedRecruitments = recruitments.map(recruitment => {
                return {
                    "recruitment_id": recruitment.id,
                    "title": recruitment.title,
                    "require": recruitment.require,
                    "low_sector": recruitment.low_sector,
                    "work_type": recruitment.work_type,
                    "dead_line": recruitment.dead_line,
                    "writer": {
                        "id": recruitment.service.id,
                        "name": recruitment.service.name,
                        "profile_img": recruitment.service.profile_img
                    }
                };
            });
            return convertBigIntsToNumbers(processedRecruitments);
        }
        catch (error) {
            console.error('전체 리크루팅 목록 조회 중 오류:', error);
            throw error;
        }
    },
    getOneRecruitment: async (recruitmentId) => {
        try {
            const findOneRecruimentQueryOptions = {
                where: {
                    id: BigInt(recruitmentId)
                },
                select: {
                    id: true,
                    title: true,
                    low_sector: true,
                    area: true,
                    require: true,
                    work_type: true,
                    dead_line: true,
                    recruiting_img: true,
                    service: {
                        select: {
                            id: true,
                            name: true,
                            profile_img: true
                        }
                    }
                }
            }
            const recruiment = await prisma.RecruitingNotice.findUnique(findOneRecruimentQueryOptions);
            if (!recruiment) {
                throw new NotFoundError({
                    message: '존재하지 않는 상위 지역입니다.',
                })
            }
            return convertBigIntsToNumbers(recruiment)
        }
        catch (error) {
            console.error('특정 리크루팅 목록 조회 중 오류:', error);
            throw error;
        }
    }
}

export default recruitmentService
