import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/*
    TODO: high_sector과 low_sector를 배열로 받음
*/


import { convertBigIntsToNumbers, listToString, stringToList } from '../../libs/dataTransformer.js'
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
            // sector 리스트를 문자열로 변경
            high_sector = listToString(high_sector)
            low_sector = listToString(low_sector)

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
    getAllRecruitment: async (highSector, lowSector = null, pageNumber = 1, limit = 10) => {
        try {
            const findAllRecruimentQueryOptions = {
                where: {
                    high_sector: {
                        contains: String(highSector)
                    },
                    // low_sector 값이 안 들어오면 탐색조건에 빼버림
                    low_sector: {
                        contains: lowSector !== null ? String(lowSector) : undefined
                    }
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
                skip: (pageNumber - 1) * limit,
                take: limit,
            }

            const recruitments = await prisma.RecruitingNotice.findMany(findAllRecruimentQueryOptions);
            const processedRecruitments = recruitments.map(recruitment => {
                const lowSectorToList = stringToList(recruitment.low_sector)
                return {
                    "recruitment_id": recruitment.id,
                    "title": recruitment.title,
                    "require": recruitment.require,
                    "low_sector": lowSectorToList,
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
    getOneRecruitment: async (recruitmentId, serviceId) => {
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
                    salary: true,
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
            const isSubscribedQueryOptions = {
                where: {
                    service_recruiting_notice_id: {
                        service_id: BigInt(serviceId),
                        recruiting_notice_id: BigInt(recruitmentId)
                    }
                },
                select: {
                    id: true
                }
            }
            const isSubscribed = await prisma.SubscribedNotice.findUnique(isSubscribedQueryOptions);
            const recruiment = await prisma.RecruitingNotice.findUnique(findOneRecruimentQueryOptions);
            if (!recruiment) {
                throw new NotFoundError({
                    message: '해당 공고가 존재하지 않습니다.',
                })
            }
            const processedRecruitment = {
                "recruitment_id": recruiment.id,
                "title": recruiment.title,
                "low_sector": stringToList(recruiment.low_sector),
                "area": recruiment.area,
                "require": recruiment.require,
                "salary": recruiment.salary,
                "work_type": recruiment.work_type,
                "dead_line": recruiment.dead_line,
                "recruiting_img": recruiment.recruiting_img,
                "is_subscribed": isSubscribed ? true : false,
                "writer": {
                    "id": recruiment.service.id,
                    "name": recruiment.service.name,
                    "profile_img": recruiment.service.profile_img
                }
            };
            return convertBigIntsToNumbers(processedRecruitment)
        }
        catch (error) {
            console.error('특정 리크루팅 목록 조회 중 오류:', error);
            throw error;
        }
    },
    deleteRecruitment: async (recruitmentId) => {
        try {
            const recruiment = await prisma.RecruitingNotice.findUnique({
                where: {
                    id: BigInt(recruitmentId)
                }
            })
            if (!recruiment) {
                throw new NotFoundError({ message: "해당 공고를 찾을 수 없습니다." })
            }
            await prisma.RecruitingNotice.delete({
                where: {
                    id: BigInt(recruitmentId)
                }
            })
            return
        }
        catch (error) {
            console.error('구인 공고 삭제 중 오류', error);
            throw error
        }
    },
    getTotalPage: async (highSector = null, lowSector = null, subscribeServiceId = null, limit = 10) => {
        try {
            console.log("highSector : ", highSector)
            console.log("lowSector : ", lowSector)
            console.log("subscribeServiceId : ", subscribeServiceId)
            console.log("limit : ", limit)

            const sectorQuery = {
                where: {
                    high_sector: {
                        contains: highSector !== null ? String(highSector) : undefined
                    },
                    low_sector: {
                        contains: lowSector !== null ? String(lowSector) : undefined
                    },

                }
            }
            const subscribedQuery = {
                where: {
                    subscribedNotices: {
                        some: {
                            service_id: subscribeServiceId !== null ? BigInt(subscribeServiceId) : undefined
                        }
                    }
                }
            }
            let totalCount = 0
            if (!subscribeServiceId) {
                totalCount = await prisma.RecruitingNotice.count({
                    ...sectorQuery
                })
            }
            else {
                totalCount = await prisma.RecruitingNotice.count({
                    ...subscribedQuery
                })
            }
            console.log("totalCount : ", totalCount)
            return Math.ceil(totalCount / limit);
        } catch (error) {
            console.error('총 페이지 수 조회 중 오류:', error);
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default recruitmentService
