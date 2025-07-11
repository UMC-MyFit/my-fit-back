import recruitmentService from './recruitments.service.js'
const recruitmentController = {
    createRecruitment: async (req, res, next) => {
        try {
            // const serviceId = req.body.service_id <- 나중에 이걸로 변경
            const serviceId = req.body.service_id
            const recruitmentData = req.body

            const result = await recruitmentService.createRecruitment(
                serviceId,
                recruitmentData
            )

            res.success({
                code: 201,
                message: '구인 공고 등록 성공',
                result,
            })
        } catch (error) {
            console.log('에러 발생')
            next(error)
        }
    },
}

export default recruitmentController
