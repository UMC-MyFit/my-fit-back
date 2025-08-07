import RelationshipsService from './relationships.service.js'
import { BadRequestError } from '../../middlewares/error.js'

class RelationshipsController {
    /**
     * POST /api/relationships/{recipient_id}/interests
     * 관심 추가
     */
    static async addInterest(req, res, next) {
        try {
            const { recipient_id } = req.params
            const senderId = req.user.service_id

            if (!recipient_id || isNaN(recipient_id) || !/^\d+$/.test(recipient_id)) {
                throw new BadRequestError({ field: 'recipient_id', message: '유효한 상대방 서비스 ID (숫자 문자열)가 필요합니다.' })
            }

            const parsedRecipientId = BigInt(recipient_id)
            const parsedSenderId = BigInt(senderId)

            await RelationshipsService.addInterest(parsedSenderId, parsedRecipientId)

            return res.success({
                code: 201,
                message: '관심이 성공적으로 추가되었습니다.',
            })
        } catch (error) {
            next(error)
        }
    }

    /**
     * DELETE /api/relationships/{recipient_id}/interests
     * 관심 해제
     */
    static async removeInterest(req, res, next) {
        try {
            const { recipient_id } = req.params
            const senderId = req.user.service_id

            if (!recipient_id || isNaN(recipient_id) || !/^\d+$/.test(recipient_id)) {
                throw new BadRequestError({ field: 'recipient_id', message: '유효한 상대방 서비스 ID (숫자 문자열)가 필요합니다.' })
            }

            const parsedRecipientId = BigInt(recipient_id)
            const parsedSenderId = BigInt(senderId)

            await RelationshipsService.removeInterest(parsedSenderId, parsedRecipientId)

            return res.success({
                code: 200,
                message: '관심이 성공적으로 해제되었습니다.',
            })
        } catch (error) {
            next(error)
        }
    }

    static async getMyInterests(req, res, next) {
        try {
            const senderId = req.user.service_id
            const { page = 1, limit = 10 } = req.query

            // 페이지네이션 파라미터 검증
            const parsedPage = parseInt(page)
            const parsedLimit = parseInt(limit)

            if (isNaN(parsedPage) || parsedPage < 1) {
                throw new BadRequestError({ field: 'page', message: '페이지는 1 이상의 숫자여야 합니다.' })
            }

            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
                throw new BadRequestError({ field: 'limit', message: '페이지 크기는 1-50 사이의 숫자여야 합니다.' })
            }

            const parsedSenderId = BigInt(senderId)

            const result = await RelationshipsService.getInterestsByUser(parsedSenderId, parsedPage, parsedLimit)
            console.log('관심 목록 조회 결과:', JSON.stringify(result, null, 2))

            return res.success({
                code: 200,
                message: '관심 목록 조회가 성공적으로 완료되었습니다.',
                result: result,
            })
        } catch (error) {
            next(error)
        }
    }

    /**
     * GET /api/relationships/interests/received 요청을 처리하여 로그인한 사용자에게 관심을 보낸 목록을 반환합니다.
     * (나를 관심 등록한 사람들 목록 조회)
     */
    static async getReceivedInterests(req, res, next) {
        try {
            const recipientId = req.user.service_id

            if (!recipientId || isNaN(recipientId) || !/^\d+$/.test(recipientId.toString())) {
                throw new BadRequestError({ field: 'recipientId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }

            const interests = await RelationshipsService.getReceivedInterests(BigInt(recipientId))
            console.log('나를 관심 등록한 목록:', interests)

            return res.success({
                code: 200,
                message: '나를 관심 등록한 목록을 성공적으로 조회했습니다.',
                result: interests,
            });
        } catch (error) {
            console.error('RelationshipsController - 받은 관심 목록 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * GET /api/relationships/interests/status/{recipient_id} 로그인한 사용자가 특정 다른 유저를 관심 등록했는지 여부를 반환합니다.
     */
    static async checkInterestStatus(req, res, next) {
        try {
            const senderId = req.user.service_id
            const { recipient_id } = req.params

            if (!senderId || isNaN(senderId) || !/^\d+$/.test(senderId.toString())) {
                throw new BadRequestError({ field: 'senderId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }
            if (!recipient_id || isNaN(recipient_id) || !/^\d+$/.test(recipient_id)) {
                throw new BadRequestError({ field: 'recipientId', message: '유효한 대상 서비스 ID가 필요합니다.' })
            }

            const isInterested = await RelationshipsService.checkInterestStatus(BigInt(senderId), BigInt(recipient_id))
            console.log(`관심 상태 조회 - senderId: ${senderId}, recipientId: ${recipient_id}, isInterested: ${isInterested}`)

            return res.success({
                code: 200,
                message: '관심 등록 상태를 성공적으로 조회했습니다.',
                result: { is_interested: isInterested },
            });
        } catch (error) {
            console.error('RelationshipsController - 관심 상태 조회 중 오류:', error);
            next(error);
        }
    }

    /**
     * GET /api/relationships/interests/sent/count/{sender_id} 특정 유저가 관심 등록한 사람들의 수를 반환
     */
    static async getSentInterestsCount(req, res, next) {
        try {
            const { sender_id } = req.params;

            if (!sender_id || isNaN(sender_id) || !/^\d+$/.test(sender_id)) {
                throw new BadRequestError({ field: 'target_service_id', message: '유효한 대상 서비스 ID가 필요합니다.' });
            }

            const count = await RelationshipsService.getSentInterestsCount(BigInt(sender_id));

            return res.success({
                code: 200,
                message: '특정 유저가 보낸 관심 수를 성공적으로 조회했습니다.',
                result: { count: count },
            });
        } catch (error) {
            console.error('RelationshipsController - 보낸 관심 수 조회 중 오류:', error);
            next(error);
        }
    }

    /**
     * GET /api/relationships/interests/received/count/{recipient_id} 특정 유저를 몇 명이 관심 등록하고 있는지 수를 반환
     */
    static async getReceivedInterestsCount(req, res, next) {
        try {
            const { recipient_id } = req.params;

            if (!recipient_id || isNaN(recipient_id) || !/^\d+$/.test(recipient_id)) {
                throw new BadRequestError({ field: 'target_service_id', message: '유효한 대상 서비스 ID가 필요합니다.' });
            }

            const count = await RelationshipsService.getReceivedInterestsCount(BigInt(recipient_id));

            return res.success({
                code: 200,
                message: '특정 유저를 관심 등록한 사람들의 수를 성공적으로 조회했습니다.',
                result: { count: count },
            });
        } catch (error) {
            console.error('RelationshipsController - 받은 관심 수 조회 중 오류:', error);
            next(error);
        }
    }

    static async sendNetworkRequest(req, res, next) {
        try {
            const senderId = req.user.service_id
            const { recipient_id } = req.params

            console.log('Received recipient_id from params:', recipient_id)
            console.log('Type of recipient_id:', typeof recipient_id)

            if (!recipient_id || isNaN(recipient_id) || !/^\d+$/.test(recipient_id)) {
                throw new BadRequestError({ field: 'recipient_id', message: '유효한 상대방 서비스 ID가 필요합니다.' })
            }

            await RelationshipsService.sendNetworkRequest(BigInt(senderId), BigInt(recipient_id))

            return res.success({
                code: 200,
                message: '네트워크 요청이 성공적으로 전송되었습니다.',
            })
        } catch (error) {
            console.error('RelationshipsController - 네트워크 요청 전송 중 오류:', error);
            next(error)
        }
    }

    static async acceptNetworkRequest(req, res, next) {
        try {
            const recipientId = req.user.service_id
            const { network_id } = req.params

            console.log('Received network_id from params:', network_id)
            console.log('Type of network_id:', typeof network_id)

            if (!network_id || isNaN(network_id) || !/^\d+$/.test(network_id)) {
                throw new BadRequestError({ field: 'network_id', message: '유효한 요청 ID가 필요합니다.' })
            }

            await RelationshipsService.updateNetworkRequestStatus(BigInt(network_id), 'ACCEPTED', BigInt(recipientId))

            return res.success({
                code: 200,
                message: '네트워크 요청이 성공적으로 수락되었습니다.',
            })
        } catch (error) {
            console.error('RelationshipsController - 네트워크 요청 수락 중 오류:', error);
            next(error)
        }
    }

    static async rejectNetworkRequest(req, res, next) {
        try {
            const recipientId = req.user.service_id
            const { network_id } = req.params

            if (!network_id || isNaN(network_id) || !/^\d+$/.test(network_id)) {
                throw new BadRequestError({ field: 'network_id', message: '유효한 요청 ID가 필요합니다.' })
            }

            await RelationshipsService.updateNetworkRequestStatus(BigInt(network_id), 'REJECTED', BigInt(recipientId))

            return res.success({
                code: 200,
                message: '네트워크 요청이 성공적으로 거절되었습니다.',
            })
        } catch (error) {
            console.error('RelationshipsController - 네트워크 요청 거절 중 오류:', error)
            next(error)
        }
    }

    static async disconnectNetwork(req, res, next) {
        try {
            const userId = req.user.service_id
            const { network_id } = req.params

            if (!network_id || isNaN(network_id) || !/^\d+$/.test(network_id)) {
                throw new BadRequestError({ field: 'network_id', message: '유효한 네트워크 ID가 필요합니다.' })
            }

            await RelationshipsService.disconnectNetwork(BigInt(network_id), BigInt(userId))

            return res.success({
                code: 200,
                message: '네트워크 연결이 성공적으로 끊어졌습니다.',
            })
        } catch (error) {
            console.error('RelationshipsController - 네트워크 연결 끊기 중 오류:', error);
            next(error);
        }
    }

    static async getNetworkConnections(req, res, next) {
        try {
            const userId = req.user.service_id
            const connections = await RelationshipsService.getNetworkConnections(BigInt(userId))

            return res.success({
                code: 200,
                message: '연결된 네트워크 목록을 성공적으로 조회했습니다.',
                result: connections,
            });
        } catch (error) {
            next(error)
        }
    }

    static async getSentNetworkRequests(req, res, next) {
        try {
            const userId = req.user.service_id
            const requests = await RelationshipsService.getSentNetworkRequests(BigInt(userId))

            return res.success({
                code: 200,
                message: '보낸 네트워크 요청 목록을 성공적으로 조회했습니다.',
                result: requests,
            })
        } catch (error) {
            console.error('RelationshipsController - 보낸 네트워크 요청 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * GET /api/relationships/networks/received 요청을 처리하여 로그인한 사용자에게 받은 대기 중인 네트워크 요청 목록을 반환
     */
    static async getReceivedNetworkRequests(req, res, next) {
        try {
            const recipientId = req.user.service_id

            if (!recipientId || isNaN(recipientId) || !/^\d+$/.test(recipientId.toString())) {
                throw new BadRequestError({ field: 'recipientId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }

            const requests = await RelationshipsService.getReceivedNetworkRequests(BigInt(recipientId))

            return res.success({
                code: 200,
                message: '받은 네트워크 요청 목록을 성공적으로 조회했습니다.',
                result: requests,
            })
        } catch (error) {
            console.error('RelationshipsController - 받은 네트워크 요청 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * GET /api/relationships/networks/status/{target_service_id} 요청을 처리하여
     * 로그인한 사용자와 특정 다른 사용자 간의 네트워크 관계 상태를 반환합니다.
     */
    static async getNetworkStatus(req, res, next) {
        try {
            const myServiceId = req.user.service_id
            const { target_service_id } = req.params

            if (!myServiceId || isNaN(myServiceId) || !/^\d+$/.test(myServiceId.toString())) {
                throw new BadRequestError({ field: 'myServiceId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }
            if (!target_service_id || isNaN(target_service_id) || !/^\d+$/.test(target_service_id)) {
                throw new BadRequestError({ field: 'target_service_id', message: '유효한 대상 서비스 ID가 필요합니다.' })
            }

            // const status = await RelationshipsService.getNetworkStatusWithUser(BigInt(myServiceId), BigInt(target_service_id))
            const { status, network_id } = await RelationshipsService.getNetworkStatusWithUser(
                BigInt(myServiceId),
                BigInt(target_service_id)
            );

            return res.success({
                code: 200,
                message: '네트워크 상태를 성공적으로 조회했습니다.',
                result: { status, network_id }
            })
        } catch (error) {
            console.error('RelationshipsController - 네트워크 상태 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * GET /api/relationships/networks/count/{target_service_id} 요청을 처리하여
     * 특정 사용자의 네트워크 연결(ACCEPTED 상태) 수를 반환합니다.
     */
    static async getNetworkConnectionsCount(req, res, next) {
        try {
            const { target_service_id } = req.params

            if (!target_service_id || isNaN(target_service_id) || !/^\d+$/.test(target_service_id)) {
                throw new BadRequestError({ field: 'target_service_id', message: '유효한 대상 서비스 ID가 필요합니다.' });
            }

            const count = await RelationshipsService.getNetworkConnectionsCount(BigInt(target_service_id))

            return res.success({
                code: 200,
                message: '네트워크 연결 수를 성공적으로 조회했습니다.',
                result: { count: count },
            });
        } catch (error) {
            console.error('RelationshipsController - 네트워크 연결 수 조회 중 오류:', error)
            next(error)
        }
    }

    /**
     * POST /api/relationships/block/{blocked_id} 요청을 처리하여 사용자를 차단
     */
    static async blockUser(req, res, next) {
        try {
            const blockerId = req.user.service_id
            const { blocked_id } = req.params

            if (!blockerId || isNaN(blockerId) || !/^\d+$/.test(blockerId.toString())) {
                throw new BadRequestError({ field: 'blockerId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }
            if (!blocked_id || isNaN(blocked_id) || !/^\d+$/.test(blocked_id)) {
                throw new BadRequestError({ field: 'blocked_id', message: '유효한 대상 서비스 ID가 필요합니다.' })
            }

            const message = await RelationshipsService.blockUser(BigInt(blockerId), BigInt(blocked_id))

            return res.success({
                code: 200, // 또는 201 Created
                message: message,
            });
        } catch (error) {
            console.error('RelationshipsController - 사용자 차단 중 오류:', error)
            next(error)
        }
    }

    /**
     * DELETE /api/relationships/unblock/{target_service_id} 요청을 처리하여 사용자의 차단을 해제
     */
    static async unblockUser(req, res, next) {
        try {
            const blocker_id = req.user.service_id
            const { blocked_id } = req.params

            if (!blocker_id || isNaN(blocker_id) || !/^\d+$/.test(blocker_id.toString())) {
                throw new BadRequestError({ field: 'blocker_id', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }
            if (!blocked_id || isNaN(blocked_id) || !/^\d+$/.test(blocked_id)) {
                throw new BadRequestError({ field: 'blocked_id', message: '유효한 대상 서비스 ID가 필요합니다.' })
            }

            const message = await RelationshipsService.unblockUser(BigInt(blocker_id), BigInt(blocked_id))

            return res.success({
                code: 200,
                message: message,
            })
        } catch (error) {
            console.error('RelationshipsController - 사용자 차단 해제 중 오류:', error)
            next(error)
        }
    }

    /**
     * GET /api/relationships/blocked_users 요청을 처리하여 로그인한 사용자가 차단한 사용자 목록을 반환
     */
    static async getBlockedUsers(req, res, next) {
        try {
            const blockerId = req.user.service_id

            if (!blockerId || isNaN(blockerId) || !/^\d+$/.test(blockerId.toString())) {
                throw new BadRequestError({ field: 'blockerId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }

            const blockedList = await RelationshipsService.getBlockedUsers(BigInt(blockerId))

            return res.success({
                code: 200,
                message: '차단한 사용자 목록을 성공적으로 조회했습니다.',
                result: blockedList,
            });
        } catch (error) {
            console.error('RelationshipsController - 차단한 사용자 목록 조회 중 오류:', error)
            next(error);
        }
    }

    /**
     * GET /api/relationships/block_status/{target_service_id} 요청을 처리하여
     * 로그인된 사용자와 특정 다른 사용자 간의 차단 여부를 반환합니다.
     */
    static async checkBlockStatus(req, res, next) {
        try {
            const myServiceId = req.user.service_id
            const { target_service_id } = req.params

            if (!myServiceId || isNaN(myServiceId) || !/^\d+$/.test(myServiceId.toString())) {
                throw new BadRequestError({ field: 'myServiceId', message: '유효한 사용자 서비스 ID가 필요합니다.' })
            }
            if (!target_service_id || isNaN(target_service_id) || !/^\d+$/.test(target_service_id)) {
                throw new BadRequestError({ field: 'target_service_id', message: '유효한 대상 서비스 ID가 필요합니다.' })
            }

            const status = await RelationshipsService.checkBlockStatus(BigInt(myServiceId), BigInt(target_service_id))

            return res.success({
                code: 200,
                message: '차단 상태를 성공적으로 조회했습니다.',
                result: status, // { is_blocked_by_me: true, is_blocked_by_them: false }
            })
        } catch (error) {
            console.error('RelationshipsController - 차단 상태 확인 중 오류:', error)
            next(error)
        }
    }
}
export default RelationshipsController
