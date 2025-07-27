import RelationshipsModel from './relationships.model.js'
import { NotFoundError, InternalServerError, BadRequestError, CustomError, ForbiddenError, ConflictError } from '../../middlewares/error.js'

// PrismaClient와 NetworkStatus를 default export에서 구조 분해하여 가져옴 (이전 mypage.service.js에서 가져옴)
import prismaPkg from '@prisma/client'
const { PrismaClient, NetworkStatus } = prismaPkg

// 트랜잭션 사용을 위해 서비스 계층에서 PrismaClient 인스턴스 유지
const prisma = new PrismaClient()

class RelationshipsService {
    /**
     * 관심 추가
     */
    static async addInterest(senderId, recipientId) {
        try {
            // 1. 자기 자신에게 관심 신청 금지
            if (senderId === recipientId) {
                throw new BadRequestError({ message: '자기 자신에게는 관심을 신청할 수 없습니다.' })
            }

            // 2. 상대방 서비스 존재 여부 확인
            const targetServiceExists = await RelationshipsModel.isServiceExists(recipientId)
            if (!targetServiceExists) {
                throw new NotFoundError('상대방 서비스를 찾을 수 없습니다.')
            }

            // 3. 차단 관계 확인
            const isBlockedBySender = await RelationshipsModel.isBlocked(senderId, recipientId)
            if (isBlockedBySender) {
                throw new ForbiddenError({ message: '차단한 사용자에게는 관심 요청을 할 수 없습니다.' })
            }

            const isBlockedByRecipient = await RelationshipsModel.isBlocked(recipientId, senderId)
            if (isBlockedByRecipient) {
                throw new ForbiddenError({ message: '차단당한 사용자에게는 관심 요청을 할 수 없습니다.' })
            }

            // 4. 이미 관심이 있는지 확인
            const existingInterest = await RelationshipsModel.findInterest(senderId, recipientId)
            if (existingInterest) {
                throw new ConflictError({ message: '이미 관심을 표시한 사용자입니다.' })
            }

            // 5. 관심 생성
            await RelationshipsModel.createInterest(senderId, recipientId)
        } catch (error) {
            console.error('RelationshipsService - 관심 추가 서비스 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '관심 추가 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 관심 해제
     */
    static async removeInterest(senderId, recipientId) {
        try {
            // 1. 관심이 존재하는지 확인
            const existingInterest = await RelationshipsModel.findInterest(senderId, recipientId)
            if (!existingInterest) {
                throw new NotFoundError('관심을 표시하지 않은 사용자입니다.')
            }

            // 2. 관심 삭제
            await RelationshipsModel.deleteInterest(senderId, recipientId)
        } catch (error) {
            console.error('RelationshipsService - 관심 해제 서비스 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '관심 해제 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 사용자가 관심 등록한 목록 조회
     */
    static async getInterestsByUser(senderId, page, limit) {
        try {
            const offset = (page - 1) * limit

            // 전체 개수 조회
            const totalCount = await RelationshipsModel.countSentInterests(senderId)
            
            // 관심 목록 조회 (페이지네이션 적용)
            const interests = await RelationshipsModel.findInterestsBySender(senderId, limit, offset)

            // 총 페이지 수 계산
            const totalPages = Math.ceil(totalCount / limit)

            return {
                interests,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        } catch (error) {
            console.error('RelationshipsService - 관심 목록 조회 서비스 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '관심 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 특정 사용자에게 관심을 보낸 사람들의 목록 조회
     * @param {BigInt} recipientId - 로그인된 사용자 (나)의 Service ID
     * @returns {Promise<Array<Object>>} 나를 관심 등록한 사람들의 목록
     */
    static async getReceivedInterests(recipientId) {
        try {
            const interests = await RelationshipsModel.findReceivedInterests(recipientId)

            return interests.map(interest => ({
                id: interest.id.toString(), // Interest 레코드의 ID
                sender_id: interest.sender.id.toString(),
                sender_name: interest.sender.name,
                sender_profile_img: interest.sender.profile_img,
            }));
        } catch (error) {
            console.error('RelationshipsService - 받은 관심 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '받은 관심 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 로그인한 사용자가 특정 다른 유저를 관심 등록했는지 여부 조회
     * @param {BigInt} senderServiceId - 로그인된 사용자 (나)의 Service ID
     * @param {BigInt} targetServiceId - 조회 대상 (다른 유저)의 Service ID
     * @returns {Promise<boolean>} 관심 등록 상태 여부 (true/false)
     */
    static async checkInterestStatus(senderServiceId, targetServiceId) {
        try {
            const interest = await RelationshipsModel.findInterestBySenderAndRecipient(senderServiceId, targetServiceId)
            return !!interest
        } catch (error) {
            console.error('RelationshipsService - 관심 상태 조회 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '관심 상태 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 특정 유저가 관심 등록한 사람들의 수 조회
     * @param {BigInt} senderId - 조회 대상 (특정 유저)의 Service ID
     * @returns {Promise<number>} 관심 등록한 사람들의 수
     */
    static async getSentInterestsCount(senderId) {
        try {
            return await RelationshipsModel.countSentInterests(senderId);
        } catch (error) {
            console.error('RelationshipsService - 보낸 관심 수 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '보낸 관심 수 조회 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * 특정 유저를 관심 등록한 사람들의 수 조회
     * @param {BigInt} targetServiceId - 조회 대상 (특정 유저)의 Service ID
     * @returns {Promise<number>} 특정 유저를 관심 등록한 사람들의 수
     */
    static async getReceivedInterestsCount(targetServiceId) {
        try {
            return await RelationshipsModel.countReceivedInterests(targetServiceId);
        } catch (error) {
            console.error('RelationshipsService - 받은 관심 수 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '받은 관심 수 조회 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * 네트워크 요청 보내기
     * @param {BigInt} senderId - 요청을 보내는 Service ID (로그인된 사용자)
     * @param {BigInt} recipientId - 요청을 받을 상대방 Service ID
     */
    static async sendNetworkRequest(senderId, recipientId) {
        try {
            // 1. 자기 자신에게 요청 금지
            if (senderId === recipientId) {
                throw new BadRequestError({ message: '자기 자신에게는 네트워크 요청을 보낼 수 없습니다.' })
            }

            // 2. 상대방 서비스 존재 여부 확인
            const targetServiceExists = await RelationshipsModel.isServiceExists(recipientId);
            if (!targetServiceExists) {
                throw new NotFoundError('요청을 보낼 상대방 서비스를 찾을 수 없습니다.')
            }

            // 3. 이미 차단 관계인지 확인
            const isBlockedBySender = await RelationshipsModel.isBlocked(senderId, recipientId);
            if (isBlockedBySender) { 
                throw new ForbiddenError({ message: '차단한 사용자에게는 네트워크 요청을 보낼 수 없습니다.' })
            }
            const isBlockedByRecipient = await RelationshipsModel.isBlocked(recipientId, senderId);
            if (isBlockedByRecipient) {
                throw new ForbiddenError({ message: '상대방이 나를 차단했으므로 네트워크 요청을 보낼 수 없습니다.' })
            }

            // 4. 이미 요청을 보냈거나 연결된 상태인지 확인
            const existingNetwork = await RelationshipsModel.findExistingNetwork(senderId, recipientId);

            if (existingNetwork) {
                if (existingNetwork.status === NetworkStatus.PENDING) {
                    throw new ConflictError({ message: '이미 해당 사용자에게 네트워크 요청을 보냈거나 받은 상태입니다.' })
                } else if (existingNetwork.status === NetworkStatus.ACCEPTED) {
                    throw new ConflictError({ message: '이미 연결된 네트워크 관계입니다.' });
                } else if (existingNetwork.status === NetworkStatus.REJECTED) {
                    // 거절된 요청은 재요청 가능 여부를 정책에 따라 판단
                    // 여기서는 Conflict로 처리하고 다시 요청하려면 상대방이 차단을 해제해야 할 수 있다는 메시지 제공
                    throw new ConflictError({ message: '이전에 거절된 요청입니다. 다시 요청하려면 상대방이 차단을 해제해야 할 수 있습니다.' })
                }
            }

            // 5. 네트워크 요청 생성
            await RelationshipsModel.createNetworkRequest(senderId, recipientId)
        } catch (error) {
            console.error('RelationshipsService - 네트워크 요청 전송 오류:', error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '네트워크 요청 전송 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 네트워크 요청 상태 업데이트 (수락 또는 거절)
     * @param {BigInt} networkId - Network 테이블의 ID
     * @param {NetworkStatus} status - 변경할 상태 ('ACCEPTED' 또는 'REJECTED')
     * @param {BigInt} userId - 요청을 처리하는 사용자의 Service ID (보안 검증용)
     */
    static async updateNetworkRequestStatus(networkId, status, userId) {
        try {
            const requestedNetwork = await RelationshipsModel.findNetworkRequestById(networkId);

            if (!requestedNetwork) {
                throw new NotFoundError('해당 네트워크 요청을 찾을 수 없습니다.');
            }

            // 요청을 받은 사람이 본인인지 확인 (보안)
            if (requestedNetwork.recipient_id !== userId) {
                throw new ForbiddenError({ message: '이 네트워크 요청을 처리할 권한이 없습니다.' });
            }

            // 이미 처리된 요청인지 확인
            if (requestedNetwork.status == NetworkStatus.ACCEPTED) {
                throw new ConflictError({ message: '이미 처리된 네트워크 요청입니다.' });
            }

            await RelationshipsModel.updateNetworkRequestStatus(networkId, status);
        } catch (error) {
            console.error('RelationshipsService - 네트워크 요청 상태 업데이트 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '네트워크 요청 처리 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * 네트워크 연결 끊기
     * @param {BigInt} networkId - Network 테이블의 ID
     * @param {BigInt} userId - 요청을 수행하는 사용자의 Service ID (보안 검증용)
     */
    static async disconnectNetwork(networkId, userId) {
        try {
            const network = await RelationshipsModel.findNetworkRequestById(networkId);

            console.log({
                userId,
                senderId: network.sender_id,
                recipientId: network.recipient_id,
                sameAsSender: network.sender_id === userId,
                sameAsRecipient: network.recipient_id === userId,
            })


            if (!network) {
                throw new NotFoundError('해당 네트워크 연결을 찾을 수 없습니다.');
            }

            // 연결을 끊는 사람이 sender 또는 recipient 중 한 명인지 확인 (보안)
            if (network.sender_id !== userId && network.recipient_id !== userId) {
                throw new ForbiddenError({ message: '이 네트워크 연결을 끊을 권한이 없습니다.' });
            }

            // ACCEPTED 상태인지 확인
            if (network.status !== NetworkStatus.ACCEPTED) {
                throw new ConflictError({ message: '활성화된 네트워크 연결이 아닙니다. 끊을 수 없습니다.' });
            }

            await RelationshipsModel.deleteNetworkConnection(networkId);
        } catch (error) {
            console.error('RelationshipsService - 네트워크 연결 끊기 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '네트워크 연결 끊기 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }

    /**
     * 내 연결 목록 조회
     * @param {BigInt} userId - 로그인된 사용자의 Service ID
     * @returns {Promise<Array<Object>>} 연결된 네트워크 목록
     */
    static async getNetworkConnections(userId) {
        try {
            const connections = await RelationshipsModel.findNetworkConnections(userId)

            // 데이터 가공: 나 자신을 제외한 상대방 정보만 반환
            return connections.map(conn => {
                const otherService = conn.sender_id === userId ? conn.recipient : conn.sender
                return {
                    id: conn.id.toString(), // Network ID
                    other_service_id: otherService.id.toString(),
                    other_service_name: otherService.name,
                    other_service_profile_img: otherService.profile_img,
                }
            })
        } catch (error) {
            console.error('RelationshipService - 네트워크 연결 조회 오류:', error)
            throw new InternalServerError({ message: '네트워크 연결 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 내가 보낸 네트워크 요청 목록 조회
     * @param {BigInt} senderId - 로그인된 사용자의 Service ID
     * @returns {Promise<Array<Object>>} 내가 보낸 네트워크 요청 목록
     */
    static async getSentNetworkRequests(senderId) {
        try {
            const requests = await RelationshipsModel.findSentNetworkRequests(senderId)

            return requests.map(req => ({
                id: req.id.toString(),
                recipient_service_id: req.recipient.id.toString(),
                recipient_service_name: req.recipient.name,
                recipient_service_profile_img: req.recipient.profile_img,
            }))
        } catch (error) {
            console.error('RelationshipsService - 보낸 네트워크 요청 조회 오류:', error);
            throw new InternalServerError({ message: '보낸 네트워크 요청 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 로그인된 사용자에게 도착한 PENDING 상태 네트워크 요청 목록 조회
     * @param {BigInt} recipientId - 로그인된 사용자 (나)의 Service ID
     * @returns {Promise<Array<Object>>} 나에게 요청 보낸 사람들의 목록
     */
    static async getReceivedNetworkRequests(recipientId) {
        try {
            const requests = await RelationshipsModel.findReceivedNetworkRequests(recipientId)

            return requests.map(req => ({
                id: req.id.toString(), // Network request ID
                sender_id: req.sender.id.toString(),
                sender_name: req.sender.name,
                sender_profile_img: req.sender.profile_img,
                status: req.status, // "PENDING"
                requested_at: req.created_at, // 요청 시간
            }))
        } catch (error) {
            console.error('RelationshipsService - 받은 네트워크 요청 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '받은 네트워크 요청 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 로그인된 사용자와 특정 다른 사용자 간의 네트워크 상태 확인
     * @param {BigInt} myServiceId - 로그인된 사용자 (나)의 Service ID
     * @param {BigInt} targetServiceId - 조회 대상 (다른 유저)의 Service ID
     * @returns {Promise<string>} 네트워크 관계 상태 (e.g., 'CONNECTED', 'PENDING_SENT', 'PENDING_RECEIVED', 'NO_RELATION')
     */
    static async getNetworkStatusWithUser(myServiceId, targetServiceId) {
        try {
            if (myServiceId === targetServiceId) {
                return 'SELF'; // 자기 자신
            }

            const network = await RelationshipsModel.findSpecificNetworkStatus(myServiceId, targetServiceId);

            if (!network) {
                return 'NO_RELATION' // 관계 없음
            }

            switch (network.status) {
                case NetworkStatus.ACCEPTED:
                    return 'CONNECTED'
                case NetworkStatus.PENDING:
                    if (network.sender_id === myServiceId) {
                        return 'PENDING_SENT' // 내가 요청을 보낸 상태
                    } else {
                        return 'PENDING_RECEIVED' // 내가 요청을 받은 상태
                    }
                case NetworkStatus.REJECTED:
                    // 거절 상태는 관계가 없는 것으로 간주하거나, 별도 메시지 필요에 따라 처리
                    return 'REJECTED' // 또는 'NO_RELATION'으로 간주
                default:
                    return 'UNKNOWN'
            }
        } catch (error) {
            console.error('RelationshipsService - 네트워크 상태 확인 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '네트워크 상태 확인 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 특정 사용자의 네트워크 연결(ACCEPTED 상태) 수 조회
     * @param {BigInt} targetServiceId - 조회 대상 (특정 유저)의 Service ID
     * @returns {Promise<number>} 네트워크 연결 수
     */
    static async getNetworkConnectionsCount(targetServiceId) {
        try {
            const count = await RelationshipsModel.countNetworkConnections(targetServiceId)
            return count
        } catch (error) {
            console.error('RelationshipsService - 네트워크 연결 수 조회 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '네트워크 연결 수 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 사용자를 차단합니다.
     * - 차단 시 기존 관심 및 네트워크 관계 제거
     * @param {BigInt} blockerId - 차단하는 사용자 (나)의 Service ID
     * @param {BigInt} blockedId - 차단당할 사용자 (상대방)의 Service ID
     * @returns {Promise<string>} 성공 메시지
     */
    static async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId) {
            throw new BadRequestError({ message: '자기 자신을 차단할 수 없습니다.' })
        }

        const targetServiceExists = await RelationshipsModel.isServiceExists(blockedId)
        if (!targetServiceExists) {
            throw new NotFoundError('차단할 상대방 서비스를 찾을 수 없습니다.')
        }

        const { isBlockedBy1 } = await RelationshipsModel.areUsersBlocked(blockerId, blockedId)
        if (isBlockedBy1) {
            throw new ConflictError({ message: '이미 차단된 사용자입니다.' })
        }

        try {
            await prisma.$transaction(async (tx) => {
                // 1. 차단 관계 생성
                await tx.userBlock.create({
                    data: {
                        blocker_id: blockerId,
                        blocked_id: blockedId,
                    },
                })

                // 2. 기존 관심 관계 삭제 (양방향)
                await tx.interest.deleteMany({
                    where: {
                        OR: [
                            { sender_id: blockerId, recipient_id: blockedId },
                            { sender_id: blockedId, recipient_id: blockerId },
                        ],
                    },
                })

                // 3. 기존 네트워크 관계 상태 업데이트 (해제)
                await tx.network.updateMany({
                    where: {
                        OR: [
                            { sender_id: blockerId, recipient_id: blockedId },
                            { sender_id: blockedId, recipient_id: blockerId },
                        ],
                        status: {
                            not: NetworkStatus.REJECTED // 이미 거절된 것은 제외
                        }
                    },
                    data: {
                        status: NetworkStatus.REJECTED,
                        updatedAt: new Date(),
                    },
                })
            })

            return '사용자 차단 및 관련 관계 정리가 성공적으로 완료되었습니다.'
        } catch (error) {
            console.error('RelationshipsService - 사용자 차단 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '사용자 차단 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 사용자의 차단을 해제합니다.
     * @param {BigInt} blockerId - 차단을 해제하는 사용자 (나)의 Service ID
     * @param {BigInt} blockedId - 차단당했던 사용자 (상대방)의 Service ID
     * @returns {Promise<string>} 성공 메시지
     */
    static async unblockUser(blockerId, blockedId) {
        const { isBlockedBy1 } = await RelationshipsModel.areUsersBlocked(blockerId, blockedId)
        if (!isBlockedBy1) {
            throw new NotFoundError('해당 사용자는 차단되어 있지 않습니다.')
        }

        try {
            await RelationshipsModel.deleteBlock(blockerId, blockedId)
            return '사용자 차단이 성공적으로 해제되었습니다.'
        } catch (error) {
            console.error('RelationshipsService - 사용자 차단 해제 오류:', error)
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '사용자 차단 해제 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 로그인된 사용자가 차단한 사용자 목록을 조회합니다.
     * @param {BigInt} blockerId - 로그인된 사용자 (나)의 Service ID
     * @returns {Promise<Array<Object>>} 차단한 사용자 목록
     */
    static async getBlockedUsers(blockerId) {
        try {
            const blockedList = await RelationshipsModel.findBlockedUsers(blockerId)
            return blockedList.map(blockUser => ({
                id: blockUser.id.toString(), 
                blocked_id: blockUser.blocked.id.toString(),
                blocked_name: blockUser.blocked.name,
                blocked_profile_img: blockUser.blocked.profile_img,
            }))
        } catch (error) {
            console.error('RelationshipsService - 차단한 사용자 목록 조회 오류:', error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new InternalServerError({ message: '차단한 사용자 목록 조회 중 서버 오류가 발생했습니다.', originalError: error.message })
        }
    }

    /**
     * 로그인된 사용자와 특정 다른 사용자 간의 차단 여부를 확인합니다.
     * @param {BigInt} myServiceId - 로그인된 사용자 (나)의 Service ID
     * @param {BigInt} targetServiceId - 조회 대상 (다른 유저)의 Service ID
     * @returns {Promise<{ is_blocked_by_me: boolean, is_blocked_by_them: boolean }>} 차단 여부
     */
    static async checkBlockStatus(myServiceId, targetServiceId) {
        if (myServiceId === targetServiceId) {
            return { is_blocked_by_me: false, is_blocked_by_them: false } // 자기 자신은 차단될 수 없음
        }
        try {
            const { isBlockedBy1, isBlockedBy2 } = await RelationshipsModel.areUsersBlocked(myServiceId, targetServiceId)
            return {
                is_blocked_by_me: isBlockedBy1, // 내가 상대방을 차단했는지
                is_blocked_by_them: isBlockedBy2, // 상대방이 나를 차단했는지
            }
        } catch (error) {
            console.error('RelationshipsService - 차단 상태 확인 오류:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new InternalServerError({ message: '차단 상태 확인 중 서버 오류가 발생했습니다.', originalError: error.message });
        }
    }
}
export default RelationshipsService