import { BadRequestError } from '../../middlewares/error.js'
import { isAuthenticated } from '../../middlewares/auth.js'
import cardsService from './cards.service.js'

const cardsController = {
    createCard: async (req, res, next) => {
        try {

            // 로그인 상태면 세션에서, 아니면 body에서
            const serviceId = req.user?.service_id || req.body.service_id
            console.log(serviceId)
            if (!serviceId) {
                throw new BadRequestError({
                    message: 'service_id가 필요합니다. (세션 또는 body에 있어야 함)'
                })
            }
            const cardData = req.body

            const result = await cardsService.createCard(serviceId, cardData)

            // 로그인 상태가 아니라면 로그인 처리
            if (!req.isAuthenticated?.() || !req.user) {
                const user = await cardsService.getUserByServiceId(serviceId)
                req.login(user, (error) => {
                    if (error) {
                        next(error)
                    }
                    res.success({
                        code: 201,
                        message: '첫 이력/활동 카드 등록 및 로그인 성공',
                        result,
                    })
                })
            } else {
                res.success({
                    code: 201,
                    message: '이력/활동 카드 등록 성공',
                    result,
                })
            }
        } catch (error) {
            console.log('에러 발생')
            next(error)
        }
    },

    getCardBySector: async (req, res, next) => {
        try {
            const { high_sector, low_sector, sort = 'latest', cursor } = req.query

            if (!high_sector || !low_sector) {
                throw new BadRequestError('high_sector와 low_sector는 필수입니다.')
            }

            if (!['latest', 'oldest'].includes(sort)) {
                throw new BadRequestError('sort는 latest 또는 oldest 여야 합니다.')
            }

            const result = await cardsService.getCardBySector(
                high_sector,
                low_sector,
                sort,
                cursor ? BigInt(cursor) : null
            )
            res.success({
                code: 200,
                message: '직무 기반 카드 조회 성공',
                result,
            })
        } catch (error) {
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
            ]
            const invalidParams = Object.keys(req.query).filter(
                (key) => !allowedParams.includes(key)
            )

            if (invalidParams.length > 0) {
                throw new BadRequestError({
                    message: `잘못된 쿼리 파라미터가 포함되어 있습니다: ${invalidParams.join(', ')}`,
                })
            }

            const { cursor, area, status, hope_job, keywords } = req.query

            // keywords 파싱 (키워드를 무조건 배열 형태로 변환)
            const keywordArray = Array.isArray(keywords)
                ? keywords
                : keywords
                    ? [keywords]
                    : []

            const result = await cardsService.getFilteredCards({
                cursor: cursor ? BigInt(cursor) : null,
                area,
                status,
                hope_job,
                keywords: keywordArray,
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

    getCardgrid: async (req, res, next) => {
        try {
            const { cursor, area, status, hope_job, keywords } = req.query

            const result = await cardsService.getCardgrid({
                cursor: cursor ? parseInt(cursor) : undefined,
                area,
                status,
                hope_job,
                // 키워드는 무조건 배열 형태로 변환
                keywords: Array.isArray(keywords)
                    ? keywords
                    : keywords
                        ? [keywords]
                        : [],
            })

            res.success({
                code: 200,
                message: '카드 전체 보기 조회 성공',
                result,
            })
        } catch (error) {
            console.log('카드 전체 보기 중 에러 발생')
            next(error)
        }
    },

    getFilteredCardsCount: async (req, res, next) => {
        try {
            const allowedParams = [
                'area',
                'status',
                'hope_job',
                'keywords',
            ]
            const invalidParams = Object.keys(req.query).filter(
                (key) => !allowedParams.includes(key)
            )

            if (invalidParams.length > 0) {
                throw new BadRequestError({
                    message: `잘못된 쿼리 파라미터가 포함되어 있습니다: ${invalidParams.join(', ')}`,
                })
            }

            const { area, status, hope_job, keywords } = req.query

            // keywords 파싱 (키워드를 무조건 배열 형태로 변환)
            const keywordArray = Array.isArray(keywords)
                ? keywords
                : keywords
                    ? [keywords]
                    : []

            const result = await cardsService.getFilteredCardsCount({
                area,
                status,
                hope_job,
                keywords: keywordArray,
            })

            res.success({
                code: 200,
                message: '필터링된 카드 개수 조회 성공',
                result,
            })
        } catch (error) {
            console.log('카드 개수 조회 중 에러 발생')
            next(error)
        }
    },
    deleteCard: async (req, res, next) => {
        try {
            const cardId = req.params.card_id
            const myServiceId = req.user?.service_id
            const result = await cardsService.deleteCard(BigInt(cardId), BigInt(myServiceId))

            res.success({
                code: 200,
                message: '이력/활동 카드 삭제 성공',
                result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default cardsController
