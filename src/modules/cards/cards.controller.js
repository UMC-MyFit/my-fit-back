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
            console.log('controller 진입')
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
}

export default cardsController
