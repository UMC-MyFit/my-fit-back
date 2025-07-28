import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers, stringToList } from '../../../libs/dataTransformer.js';
import { ConflictError, NotFoundError } from '../../../middlewares/error.js'

const prisma = new PrismaClient();

class Subscription {
    static async subscribe(serviceId, recruitmentId) {
        try {
            // 오류 검사 및 처리
            const recruiment = await prisma.RecruitingNotice.findUnique({
                where: {
                    id: BigInt(recruitmentId)
                }
            })
            if (!recruiment) {
                throw new NotFoundError({ message: "해당 공고를 찾을 수 없습니다." })
            }
            const subscription = await prisma.SubscribedNotice.findUnique({
                where: {
                    service_recruiting_notice_id: {
                        service_id: BigInt(serviceId),
                        recruiting_notice_id: BigInt(recruitmentId),
                    },
                }
            })
            if (subscription) {
                throw new ConflictError({ message: "이미 구독한 공고입니다." })
            }

            await prisma.SubscribedNotice.create({
                data: {
                    service_id: BigInt(serviceId),
                    recruiting_notice_id: BigInt(recruitmentId)
                }
            })
            return
        }
        catch (error) {
            console.error('리크루팅 구독 오류:', error);
            throw error;
        }
    }
    static async unSubscribe(serviceId, recruitmentId) {
        try {
            // 오류 검사 및 처리
            const recruiment = await prisma.RecruitingNotice.findUnique({
                where: {
                    id: BigInt(recruitmentId)
                }
            })
            if (!recruiment) {
                throw new NotFoundError({ message: "해당 공고를 찾을 수 없습니다." })
            }
            const subscription = await prisma.SubscribedNotice.findUnique({
                where: {
                    service_recruiting_notice_id: {
                        service_id: BigInt(serviceId),
                        recruiting_notice_id: BigInt(recruitmentId),
                    },
                }
            })
            if (!subscription) {
                throw new ConflictError({ message: "해당 공고를 구독한 내역이 없습니다." })
            }

            await prisma.SubscribedNotice.delete({
                where: {
                    service_recruiting_notice_id: {
                        service_id: BigInt(serviceId),
                        recruiting_notice_id: BigInt(recruitmentId),
                    },
                }
            });
            return
        }
        catch (error) {
            console.error('리크루팅 구독 오류:', error);
            throw error;
        }
    }
    static async getSubscribedRecruitments(serviceId, pageNumber = 1, limit = 10) {
        try {
            const subscribedRecruitmentsQueryOptions = {
                where: {
                    service_id: BigInt(serviceId)
                },
                select: {
                    recruitingNotice: {
                        select: {
                            id: true,
                            title: true,
                            low_sector: true,
                            dead_line: true,
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                    profile_img: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { id: 'desc' }
                ],
                skip: (pageNumber - 1) * limit,
                take: limit,
            }

            const recruitments = await prisma.SubscribedNotice.findMany(subscribedRecruitmentsQueryOptions);
            const processedRecruitments = recruitments.map(recruitment => {
                const lowSectorToList = stringToList(recruitment.recruitingNotice.low_sector)
                return {
                    "recruitment_id": recruitment.recruitingNotice.id,
                    "title": recruitment.recruitingNotice.title,
                    "low_sector": lowSectorToList,
                    "dead_line": recruitment.recruitingNotice.dead_line,
                    "writer": {
                        "id": recruitment.recruitingNotice.service.id,
                        "name": recruitment.recruitingNotice.service.name,
                        "profile_img": recruitment.recruitingNotice.service.profile_img
                    }
                };
            });

            return convertBigIntsToNumbers(processedRecruitments);
        }
        catch (error) {
            console.error('구독한 리크루팅 목록 조회 오류:', error);
            throw error;
        }
    }

}

export default Subscription