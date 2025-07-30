import recruitmentService from './recruitments.service.js'
const recruitmentController = {
    createRecruitment: async (req, res, next) => {
        try {
            const serviceId = req.user.service_id
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
    getAllRecruitment: async (req, res, next) => {
        try {
            const limit = 10
            const highSector = req.query.highSector
            const lowSector = req.query.lowSector
            const pageNumber = req.query.page ? parseInt(req.query.page) : 1;
            const [recruitments, totalPage] = await Promise.all([
                recruitmentService.getAllRecruitment(highSector, lowSector, pageNumber, limit),
                recruitmentService.getTotalPage(highSector, lowSector, null, limit)
            ]);

            res.success({
                code: 200,
                message: '구인 공고 조회 성공',
                result: {
                    recruitments,
                    pagination: {
                        total_page: totalPage
                    }
                }
            });
        }
        catch (error) {
            console.error('전체 리크루팅 목록 조회 중 오류:', error);
            next(error);
        }
    },
    getOneRecruitment: async (req, res, next) => {
        try {
            const recruitmentId = req.params.recruitmentId;
            const serviceId = req.user.service_id
            const recruitment = await recruitmentService.getOneRecruitment(recruitmentId, serviceId)
            res.success({
                code: 200,
                message: '구인 공고 조회 성공',
                result: {
                    recruitment,
                }
            });
        }
        catch (error) {
            console.error('특정 리크루팅 목록 조회 중 오류:', error);
            next(error);
        }
    },
    deleteRecruitment: async (req, res, next) => {
        try {
            const recruitmentId = req.params.recruitmentId;
            await recruitmentService.deleteRecruitment(recruitmentId)
            res.success({
                code: 200,
                message: '구인 공고가 삭제되었습니다.',
            });
        }
        catch (error) {
            console.error('구인 공고 삭제 중 오류', error);
            next(error);
        }
    }
}

export default recruitmentController
