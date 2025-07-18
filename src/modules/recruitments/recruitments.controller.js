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
            const lastRecruimentId = req.query.cursor ? parseInt(req.query.cursor) : null;
            const recruitments = await recruitmentService.getAllRecruitment(highSector, lowSector, lastRecruimentId, limit)
            const hasMore = recruitments.length === limit;
            const nextCursorId = hasMore && recruitments.length > 0 ? recruitments[recruitments.length - 1].id : null;
            res.success({
                code: 200,
                message: '구인 공고 조회 성공',
                result: {
                    recruitments,
                    pagination: {
                        hasMore,
                        nextCursorId
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
            console.log('전체 params:', req.params); // 추가
            console.log('전체 URL:', req.url); // 추가
            console.log('원본 URL:', req.originalUrl); // 추가
            const recruitmentId = req.params.recruitmentId;
            console.log(recruitmentId)
            const recruitment = await recruitmentService.getOneRecruitment(recruitmentId)
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
            console.log(recruitmentId)
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
