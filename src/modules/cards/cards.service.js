import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../../middlewares/error.js'

const cardsService = {
    createCard: async (
        serviceId,
        {
            card_img,
            card_one_line_profile,
            detailed_profile,
            link,
            keyword_text,
        }
    ) => {
        try {
            console.log(' service 접근')
            // 1. 활동 카드 생성
            const newCard = await prisma.activityCard.create({
                data: {
                    card_img,
                    one_line_profile: card_one_line_profile,
                    detailed_profile,
                    link,
                    service_id: serviceId,
                },
            })

            // 2. 키워드 생성
            await Promise.all(
                keyword_text.map((text) =>
                    prisma.keyword.create({
                        data: {
                            keyword_text: text,
                            card_id: newCard.id,
                        },
                    })
                )
            )

            // 3. user 테이블에서 해당 service_id를 가진 유저의 is_profile_completed가 false일 경우 true로 변경
            const userDB = await prisma.userDB.findFirst({
                where: { service_id: serviceId },
                include: { user: true },
            })

            if (userDB?.user?.is_profile_completed === false) {
                await prisma.user.update({
                    where: { id: userDB.user_id },
                    data: { is_profile_completed: true },
                })
            }
            return convertBigIntsToNumbers({
                card_id: newCard.id,
                service_id: newCard.service_id,
                message: '이력/활동 카드 등록 성공',
            })
        } catch (error) {
            console.error('이력/활동 카드 생성 오류:', error)

            if (error?.code === 'P2003') {
                throw new NotFoundError({
                    message:
                        '해당 service_id에 해당하는 서비스가 존재하지 않습니다.',
                })
            }

            throw new InternalServerError({
                message: '이력/활동 카드 등록 실패',
            })
        }
    },

    getCardById: async (cardId) => {
        console.log('service 진입')
        const card = await prisma.activityCard.findUnique({
            where: { id: cardId },
            include: {
                keywords: true,
                service: true,
            },
        })

        console.log(card)

        if (!card) {
            throw new NotFoundError({
                message: '해당 이력/활동 카드가 존재하지 않습니다.',
            })
        }

        const result = {
            id: card.id,
            card_img: card.card_img,
            card_one_line_profile: card.one_line_profile,
            detailed_profile: card.detailed_profile,
            link: card.link,
            keyword_text: card.keywords.map((k) => k.keyword_text),
            writer: {
                id: card.service.id,
                name: card.service.name,
                sector: card.service.low_sector,
                profile_img_url: card.service.profile_img,
            },
        }

        return convertBigIntsToNumbers(result)
    },

    getFilteredCards: async ({
        cursor,
        area,
        status,
        hope_job,
        keywords,
        sort,
        isFiltered = false,
    }) => {
        try {
            console.log('service 진입')

            const whereClause = {}
            const TAKE_LIMIT = 10

            // 1. 활동 지역
            if (area) {
                whereClause.service = {
                    userAreas: {
                        some: {
                            high_area: {
                                equals: area,
                            }
                        },
                    },
                }
            }
            console.log('활동 지역 필터링 완료')

            // 2. 상태 필터링
            if (status) {
                whereClause.AND = whereClause.AND || []
                whereClause.AND.push({
                    service: {
                        recruiting_status: {
                            contains: status,
                        },
                    },
                })
            }
            console.log('상태 필터링 완료')

            // 3. 키워드
            if (keywords?.length > 0) {
                whereClause.AND = whereClause.AND || []
                keywords.forEach((keyword) => {
                    whereClause.AND.push({
                        keywords: {
                            some: {
                                keyword_text: keyword,
                            },
                        },
                    })
                })
            }

            console.log('키워드 필터링 완료')

            // 4. 정렬
            // 정렬 조건
            let orderBy
            if (sort === 'oldest') {
                orderBy = { id: 'asc' }
            } else {
                orderBy = { id: 'desc' }
            }

            console.log('정렬 필터링 완료')

            // 5. 카드 가져오기
            const cards = await prisma.activityCard.findMany({
                where: whereClause,
                include: {
                    keywords: true,
                },
                take: TAKE_LIMIT,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
                orderBy,
            })

            console.log('카드 가져오기 완료')

            const total_count = await prisma.activityCard.count({
                where: whereClause,
            })

            const next_cursor =
                cards.length === TAKE_LIMIT ? cards[cards.length - 1].id : null

            // 6. 작성자 직업(sector) 조회
            const serviceIds = cards.map((card) => card.service_id)
            const userDBs = await prisma.userDB.findMany({
                where: {
                    service_id: { in: serviceIds },
                    ...(hope_job && {
                        service: {
                            low_sector: {
                                contains: hope_job,
                            },
                        },
                    }),
                },
                include: {
                    service: true,
                },
            })

            console.log('작성자 직업 조회 완료')

            // 필터링된 서비스 ID만 추출
            const validServiceIds = new Set(
                userDBs.map((udb) => udb.service_id)
            )

            // service_id → sector 매핑
            const serviceIdToSector = {}
            userDBs.forEach((udb) => {
                serviceIdToSector[udb.service_id] =
                    udb.service?.low_sector || '직무 미입력'
            })

            // 7. 최종 필터링 + 포맷팅
            const filteredCards = cards.filter((card) =>
                validServiceIds.has(card.service_id)
            )

            const formatted = filteredCards.map((card) => ({
                card_id: card.id,
                title: serviceIdToSector[card.service_id], // 작성자의 직무
                image_url: `https://myfit.com/cards/${card.id}.jpg`,
                one_line_profile: card.one_line_profile, // 카드 소개글
                tags: card.keywords.map((kw) => kw.keyword_text),
            }))

            console.log('최종 필터링 완료')

            return convertBigIntsToNumbers({
                cards: formatted,
                total_count: formatted.length,
                next_cursor,
                has_next: !!next_cursor,
            })
        } catch (error) {
            console.error('카드 필터링 오류:', error)
            throw new BadRequestError({
                message: '필터링에 오류가 발생하였습니다.',
            })
        }
    },

    getCardgrid: async ({ cursor, area, status, hope_job, keywords }) => {
        try {
            const TAKE_LIMIT = 10
            const whereClause = {}

            // 1. 활동 지역
            if (area) {
                whereClause.service = {
                    userAreas: {
                        some: {
                            high_area: {
                                equals: area,
                            }
                        },
                    },
                }
            }

            // 2. 상태
            if (status) {
                whereClause.AND = whereClause.AND || []
                whereClause.AND.push({
                    service: {
                        recruiting_status: {
                            contains: status,
                        },
                    },
                })
            }

            // 키워드 (모두 포함)
            if (keywords?.length > 0) {
                whereClause.AND = whereClause.AND || []
                keywords.forEach((kw) => {
                    whereClause.AND.push({
                        keywords: {
                            some: {
                                keyword_text: {
                                    equals: kw,
                                },
                            },
                        },
                    })
                })
            }

            // 최신순 정렬
            const orderBy = { id: 'desc' }

            const cards = await prisma.activityCard.findMany({
                where: whereClause,
                select: {
                    id: true,
                    service_id: true,
                },
                take: TAKE_LIMIT,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
                orderBy,
            })

            // 작성자 직무 필터
            const serviceIds = cards.map((card) => card.service_id)
            const userDBs = await prisma.userDB.findMany({
                where: {
                    service_id: { in: serviceIds },
                    ...(hope_job && {
                        service: {
                            low_sector: {
                                contains: hope_job,
                            },
                        },
                    }),
                },
                include: {
                    service: true,
                },
            })

            const validServiceIds = new Set(
                userDBs.map((udb) => udb.service_id)
            )

            const filteredCards = cards.filter((card) =>
                validServiceIds.has(card.service_id)
            )

            const formatted = filteredCards.map((card) => ({
                card_id: card.id,
                image_url: `https://myfit.com/cards/${card.id}.jpg`,
            }))

            const next_cursor =
                cards.length === TAKE_LIMIT ? cards[cards.length - 1].id : null

            return convertBigIntsToNumbers({
                cards: formatted,
                total_count: formatted.length,
                next_cursor,
                has_next: !!next_cursor,
            })
        } catch (error) {
            console.log('service, 카드 전체 조회 실패:', error)
            throw new BadRequestError({ message: '카드 전체 조회 실패' })
        }
    },

    getUserByServiceId: async (serviceId) => {
        const userDB = await prisma.userDB.findFirst({
            where: { service_id: serviceId },
            include: {
                user: true,
                service: true,
            }
        })

        if (!userDB || !userDB.user) {
            throw new NotFoundError('해당 서비스 아이디를 가진 사용자를 찾을 수 없습니다.')
        }

        return {
            service_id: serviceId,
            email: userDB.user.email,
            name: userDB.user.name,

        }
    },

    getCardsByServiceId: async (serviceId) => { // limit, cursor 파라미터 추가 가능
        try {
            const cards = await prisma.activityCard.findMany({
                where: {
                    service_id: serviceId,
                },
                orderBy: {
                    id: 'desc', // 최신 카드가 먼저 오도록 내림차순 정렬
                },
                // include 또는 select를 사용하여 필요한 관계 데이터를 가져올 수 있습니다.
                // 예: 키워드 정보가 필요하다면 include: { keywords: true }
                include: {
                    keywords: true, // ActivityCard와 연결된 키워드도 가져옵니다.
                },
                // take: limit, // 페이징을 위한 limit
                // cursor: cursor ? { id: cursor } : undefined, // 페이징을 위한 cursor
            })

            // BigInt를 Number로 변환 (이미 convertBigIntsToNumbers 유틸리티가 있다면 활용)
            const formattedCards = cards.map(card => ({
                id: card.id.toString(), // ID를 문자열로 변환 (BigInt)
                card_img: card.card_img,
                one_line_profile: card.one_line_profile,
                detailed_profile: card.detailed_profile,
                link: card.link,
                created_at: card.created_at,
                updated_at: card.updated_at,
                // 키워드도 변환하여 포함
                keywords: card.keywords.map(kw => kw.keyword_text),
            }))

            return convertBigIntsToNumbers(formattedCards) // 모든 BigInt를 변환하는 유틸리티 사용
        } catch (error) {
            console.error('cardsService - 사용자 카드 조회 중 오류:', error)
            throw new InternalServerError({ message: '사용자 이력/활동 카드 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }
}

export default cardsService
