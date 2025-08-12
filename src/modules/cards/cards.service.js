import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import {
    BadRequestError,
    ForbiddenError,
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
    getCardBySector: async (high_sector, low_sector, sort, cursor) => {
        const TAKE_LIMIT = 20;
        try {
            const order = sort === 'latest' ? 'desc' : 'asc';

            const whereClause = {
                ...(cursor && {
                    id: order === 'desc'
                        ? { lt: BigInt(cursor) }
                        : { gt: BigInt(cursor) },
                }),

                // 핵심!  하나의 service 필터 안에서 high-sector AND (OR-low-sector)
                service: {
                    AND: [
                        { high_sector: high_sector },
                        ...(low_sector
                            ? [{
                                OR: [
                                    { low_sector: { contains: low_sector } },
                                    { low_sector: { contains: `, ${low_sector}` } },
                                    { low_sector: { contains: `${low_sector},` } },
                                ],
                            }]
                            : []),
                    ],
                },
            };

            const cards = await prisma.activityCard.findMany({
                where: whereClause,
                include: {
                    keywords: {
                        select: { keyword_text: true },
                    },
                    service: {
                        include: {
                            userDBs: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    created_at: order,
                },
                take: TAKE_LIMIT,
            });

            const filteredCards = cards.filter(card =>
                card.service.userDBs.some(
                    udb => udb.user.division === 'personal'
                )
            );

            const hasNext = filteredCards.length === TAKE_LIMIT;
            const nextCursor =
                hasNext ? filteredCards[filteredCards.length - 1].id : null;

            return convertBigIntsToNumbers({
                cards: filteredCards.map(card => ({
                    card_id: card.id,
                    author_name:
                        card.service.userDBs.find(
                            udb => udb.user.division === 'personal'
                        )?.user?.name || '알 수 없음',
                    recruiting_status: card.service.recruiting_status,
                    keywords: card.keywords.map(k => k.keyword_text),
                    card_img: card.card_img,
                    one_line_profile: card.one_line_profile,
                })),
                next_cursor: nextCursor,
                has_next: !!nextCursor,
            });
        } catch (err) {
            console.error('getCardBySector 에러:', err);
            throw err;
        }
    },
    getCardById: async (cardId) => {
        const card = await prisma.activityCard.findUnique({
            where: { id: cardId },
            include: {
                keywords: true,
                service: true,
            },
        })


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

    getFilteredCards: async ({ cursor, area, status, hope_job, keywords }) => {
        try {

            const TAKE_LIMIT = 10

            // 기본 whereClause 시작
            const whereClause = {}

            // 1. 활동 지역 필터링
            if (area) {
                whereClause.service = {
                    userAreas: {
                        some: {
                            high_area: {
                                equals: area,
                            },
                        },
                    },
                }
            }

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

            // 3. 키워드 필터링
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

            // 4. hope_job 필터링 (low_sector에 부분 포함되도록 contains OR 조건 사용)
            if (hope_job) {
                whereClause.AND = whereClause.AND || []
                whereClause.AND.push({
                    OR: [
                        { service: { low_sector: { contains: hope_job } } },
                        { service: { low_sector: { contains: `, ${hope_job}` } } },
                        { service: { low_sector: { contains: `${hope_job},` } } },
                    ],
                })
            }

            // 5. 정렬
            const orderBy = { id: 'desc' }

            // 6. 카드 조회 (페이지네이션 포함)
            const cards = await prisma.activityCard.findMany({
                where: whereClause,
                include: {
                    keywords: true,
                    service: true,
                },
                take: TAKE_LIMIT,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
                orderBy,
            })

            // 7. total count 계산 (whereClause와 동일 조건)
            const totalFilteredCount = await prisma.activityCard.count({
                where: whereClause,
            })

            // 8. 최종 포맷팅
            const formatted = cards.map((card) => ({
                card_id: card.id,
                title: card.service?.low_sector,
                author_name: card.service?.name,
                recruiting_status: card.service?.recruiting_status,
                card_img: card.card_img,
                one_line_profile: card.one_line_profile,
                keywords: card.keywords.map((kw) => kw.keyword_text),
            }))

            // 9. next_cursor 계산
            const next_cursor =
                cards.length === TAKE_LIMIT ? cards[cards.length - 1].id : null

            return convertBigIntsToNumbers({
                cards: formatted,
                total_count: totalFilteredCount,
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
            const TAKE_LIMIT = 10;

            const where = {};

            if (area) {
                where.service = {
                    userAreas: { some: { high_area: area } },
                };
            }

            if (status) {
                where.AND = where.AND || [];
                where.AND.push({
                    service: { recruiting_status: { contains: status } },
                });
            }

            if (keywords?.length) {
                where.AND = where.AND || [];
                keywords.forEach(kw =>
                    where.AND.push({ keywords: { some: { keyword_text: kw } } }),
                );
            }

            if (hope_job) {
                where.AND = where.AND || [];
                where.AND.push({
                    service: {
                        OR: [
                            { low_sector: { contains: hope_job } },
                            { low_sector: { contains: `, ${hope_job}` } },
                            { low_sector: { contains: `${hope_job},` } },
                        ],
                    },
                });
            }

            const total_count = await prisma.activityCard.count({ where });

            const cards = await prisma.activityCard.findMany({
                where,
                select: { id: true, card_img: true },
                take: TAKE_LIMIT,
                ...(cursor && { skip: 1, cursor: { id: cursor } }),
                orderBy: { id: 'desc' },
            });

            const next_cursor =
                cards.length === TAKE_LIMIT ? cards[cards.length - 1].id : null;

            const formatted = cards.map(c => ({
                card_id: c.id,
                card_img: c.card_img,
            }));

            return convertBigIntsToNumbers({
                cards: formatted,
                total_count,
                next_cursor,
                has_next: !!next_cursor,
            });
        } catch (error) {
            console.error('service, 카드 전체 조회 실패:', error);
            throw new BadRequestError({ message: '카드 전체 조회 실패' });
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

    getCardsByServiceId: async (serviceId, limit = 10, cursor = null) => {
        try {
            const queryOptions = {
                where: {
                    service_id: serviceId,
                },
                orderBy: {
                    id: 'desc',
                },
                take: limit,
                include: {
                    keywords: true,
                },
            }

            if (cursor) {
                queryOptions.cursor = { id: cursor }
                queryOptions.skip = 1
            }

            const cards = await prisma.activityCard.findMany(queryOptions)

            const formattedCards = cards.map(card => ({
                id: card.id.toString(),
                card_img: card.card_img,
                one_line_profile: card.one_line_profile,
                detailed_profile: card.detailed_profile,
                link: card.link,
                created_at: card.created_at,
                updated_at: card.updated_at,
                keywords: card.keywords.map(kw => kw.keyword_text),
            }))

            const nextCursor = cards.length === limit ? cards[cards.length - 1].id : null

            return convertBigIntsToNumbers(formattedCards)
        } catch (error) {
            console.error('cardsService - 사용자 카드 조회 중 오류:', error)
            throw new InternalServerError({ message: '사용자 이력/활동 카드 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    },

    getFilteredCardsCount: async ({ area, status, hope_job, keywords }) => {
        try {

            const whereClause = {}

            // 1. 활동 지역 필터링
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

            // 3. 키워드 필터링
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

            // 4. 카드 조회
            const cards = await prisma.activityCard.findMany({
                where: whereClause,
                select: {
                    id: true,
                    service_id: true,
                },
            })

            // 5. 작성자 직무 필터링
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
                select: {
                    service_id: true,
                },
            })

            // 6. 최종 필터링된 카드 개수 계산
            const validServiceIds = new Set(
                userDBs.map((udb) => udb.service_id)
            )

            const filteredCardsCount = cards.filter((card) =>
                validServiceIds.has(card.service_id)
            ).length


            return convertBigIntsToNumbers({
                count: filteredCardsCount,
            })
        } catch (error) {
            console.error('카드 개수 조회 오류:', error)
            throw new BadRequestError({
                message: '카드 개수 조회에 오류가 발생하였습니다.',
            })
        }
    },
    deleteCard: async (cardId, myServiceId) => {

        // 1. 카드 존재/소유자 확인
        const card = await prisma.activityCard.findUnique({
            where: { id: cardId },
            select: { id: true, service_id: true },
        })

        if (!card) {
            throw new NotFoundError('존재하지 않는 활동 카드입니다.')
        }

        const myId = BigInt(myServiceId)
        if (card.service_id !== myId) {
            throw new ForbiddenError('해당 이력/활동 카드를 삭제할 권한이 없습니다.')
        }

        // 2. 키워드 -> 카드 순서대로 삭제
        await prisma.$transaction(async (tx) => {
            await tx.keyword.deleteMany({
                where: { card_id: cardId },
            })
            await tx.activityCard.delete({
                where: { id: cardId },
            })
        })

        return convertBigIntsToNumbers({
            deleted_card_id: cardId,
        })

    }
}

export default cardsService
