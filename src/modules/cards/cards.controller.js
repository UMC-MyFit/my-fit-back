import { BadRequestError } from '../../middlewares/error.js'
import cardsService from './cards.service.js'

const cardsController = {
    createCard: async (req, res, next) => {
        try {
            console.log('controller 접근')
            // 나중에 serviceId = req.session.user.service_id; 로 교체 예정
            const serviceId = req.body.service_id
            const cardData = req.body

            const result = await cardsService.createCard(serviceId, cardData)

            res.success({
                code: 201,
                message: '이력/활동 카드 등록 성공',
                result,
            })
        } catch (error) {
            console.log('에러 발생')
            next(error)
        }
    },

    getCardById: async (req, res, next) => {
        try {
            console.log('카드 조회 controller 진입')
            const cardId = BigInt(req.params.card_id)
            const card = await cardsService.getCardById(cardId)

            res.success({
                code: 200,
                message: '이력/활동 카드 상세 조회 성공',
                result: { card },
            })
        } catch (error) {
            console.log('에러 발생')
            next(error)
        }
    },

    getFilteredCards: async (req, res, next) => {
        try {
            const allowedParams = [
                'cursor',
                'area',
                'status',
                'hope_job',
                'keywords',
                'sort',
            ]
            const invalidParams = Object.keys(req.query).filter(
                (key) => !allowedParams.includes(key)
            )

            if (invalidParams.length > 0) {
                throw new BadRequestError({
                    message: `잘못된 쿼리 파라미터가 포함되어 있습니다: ${invalidParams.join(', ')}`,
                })
            }

            const { cursor, area, status, hope_job, keywords, sort } = req.query

            // keywords 파싱 (키워드를 무조건 배열 형태로 변환)
            const keywordArray = Array.isArray(keywords)
                ? keywords
                : keywords
                  ? [keywords]
                  : []

            // 필터링 여부 판단 (하나라도 참이면 필터링 처리)
            const isFiltered =
                !!area || !!status || !!hope_job || keywordArray.length > 0

            const result = await cardsService.getFilteredCards({
                cursor: cursor ? BigInt(cursor) : null,
                area,
                status,
                hope_job,
                keywords: keywordArray,
                sort,
                isFiltered,
            })

            res.success({
                code: 200,
                message: '카드 목록 필터 조회 성공',
                result,
            })
        } catch (error) {
            console.log('에러 발생')
            next(error)
        }
    },
}

export default cardsController
