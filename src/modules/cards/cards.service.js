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
                sector: card.service.sector,
                profile_img_url: card.service.profile_img,
            },
        }

        return convertBigIntsToNumbers(result)
    },
}

export default cardsService
