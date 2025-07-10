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
                message: '활동 카드 등록 성공',
                result,
            })
        } catch (error) {
            console.log('에러 발생')
            next(err)
        }
    },
}

export default cardsController
