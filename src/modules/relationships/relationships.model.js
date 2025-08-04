import prismaPkg from '@prisma/client'
const { PrismaClient, NetworkStatus } = prismaPkg

// BigInt 처리 유틸리티 (필요시 사용, 여기서는 직접 사용하지는 않음)
// import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';

const prisma = new PrismaClient()

class RelationshipsModel {
    static async isServiceExists(serviceId) {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true }
        })
        return !!service
    }

    static async findUserIdByServiceId(serviceId) {
        const userDB = await prisma.userDB.findFirst({
            where: { service_id: serviceId },
            select: { user_id: true }
        })
    }

    /**
     * 특정 Service가 존재하는지 확인합니다.
     * @param {BigInt} serviceId - 확인할 Service의 BigInt ID
     * @returns {Promise<Object | null>} - Service 객체 (id만 포함) 또는 null
     */
    static async findServiceById(serviceId) {
        return await prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true }
        })
    }

    /**
     * Service ID가 특정 User ID에 속하는지 확인합니다.
     * @param {BigInt} serviceId - Service 테이블의 ID
     * @param {BigInt} userId - User 테이블의 ID
     * @returns {Promise<boolean>} - 소유 관계가 있으면 true, 없으면 false
     */
    static async isServiceOwnedByUser(serviceId, userId) {
        const userDB = await prisma.userDB.findFirst({
            where: {
                service_id: serviceId,
                user_id: userId
            }
        })
        return !!userDB
    }

    /**
     * 이미 존재하는 관심 관계인지 조회합니다.
     * @param {BigInt} senderId - 관심을 보낸 Service의 BigInt ID
     * @param {BigInt} recipientId - 관심을 받은 Service의 BigInt ID
     * @returns {Promise<Object | null>} - Interest 객체 또는 null
     */
    static async findInterest(senderId, recipientId) {
        return await prisma.interest.findUnique({
            where: {
                unique_interest_pair: { // schema.prisma에 정의한 unique 인덱스 이름
                    sender_id: senderId,
                    recipient_id: recipientId,
                },
            },
        })
    }

    /**
     * 새로운 관심 관계를 생성합니다.
     * @param {BigInt} senderId - 관심을 보낸 Service의 BigInt ID
     * @param {BigInt} recipientId - 관심을 받은 Service의 BigInt ID
     * @returns {Promise<Object>} - 생성된 Interest 객체
     */
    static async createInterest(senderId, recipientId) {
        return await prisma.interest.create({
            data: {
                sender_id: senderId,
                recipient_id: recipientId,
                is_ban: false, // 기본값은 false로 설정
            },
        })
    }

    /**
     * 기존 관심 관계를 삭제합니다.
     * @param {BigInt} senderId - 관심을 보낸 Service의 BigInt ID
     * @param {BigInt} recipientId - 관심을 받은 Service의 BigInt ID
     * @returns {Promise<Object>} - 삭제된 Interest 객체
     */
    static async deleteInterest(senderId, recipientId) {
        return await prisma.interest.delete({
            where: {
                unique_interest_pair: {
                    sender_id: senderId,
                    recipient_id: recipientId,
                },
            },
        })
    }

    /**
     * 특정 사용자가 보낸 관심 (Interest) 목록을 조회합니다.
     * @param {BigInt} senderId - 관심을 보낸 사용자 (Service)의 BigInt ID
     * @returns {Promise<Array<Object>>} 관심 목록 배열
     */
    static async findSentInterests(senderId) {
        return prisma.interest.findMany({
            where: {
                sender_id: senderId,
            },
            include: {
                // 관심을 받은(recipient) 서비스의 정보 포함
                recipient: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true, // 프로필 이미지 필드가 있다면 포함
                    },
                },
            },
        });
    }

    /**
     * 특정 사용자가 관심 등록한 사람들의 수를 카운트
     */
    static async countSentInterests(senderId) {
        return await prisma.interest.count({
            where: {
                sender_id: senderId
            }
        })
    }

    /**
     * 특정 사용자를 관심 등록한 사람들의 수를 카운트
     */
    static async countReceivedInterests(recipientId) {
        return await prisma.interest.count({
            where: {
                recipient_id: recipientId
            }
        })
    }

    /**
     * 사용자가 관심 등록한 목록 조회 (페이지네이션)
     */
    static async findInterestsBySender(senderId, limit, offset) {
        return await prisma.interest.findMany({
            where: {
                sender_id: senderId
            },
            include: {
                recipient: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true,
                        low_sector: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            },
            take: limit,
            skip: offset
        })
    }

    /**
     * 특정 사용자에게 관심을 보낸 (recipient_id가 특정 사용자인) 관심 목록을 조회합니다.
     * @param {BigInt} recipientId - 관심을 받은 사용자 (Service)의 BigInt ID
     * @returns {Promise<Array<Object>>} 관심 목록 배열
     */
    static async findReceivedInterests(recipientId) {
        return prisma.interest.findMany({
            where: {
                recipient_id: recipientId,
            },
            include: {
                // 관심을 보낸(sender) 서비스의 정보 포함
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true, 
                    },
                },
            },
        });
    }

    /**
     * 두 서비스 ID 간의 특정 관심 관계를 조회합니다.
     * @param {BigInt} senderId - 관심을 보낸 사용자 (Service)의 BigInt ID
     * @param {BigInt} recipientId - 관심을 받은 사용자 (Service)의 BigInt ID
     * @returns {Promise<Object|null>} Interest 레코드 또는 null
     */
    static async findInterestBySenderAndRecipient(senderId, recipientId) {
        return prisma.interest.findUnique({
            where: {
                unique_interest_pair: { // Prisma 복합 유니크 키 사용
                    sender_id: senderId,
                    recipient_id: recipientId,
                },
            },
        });
    }

    /**
     * 특정 사용자에게 차단 관계가 있는지 확인합니다.
     * is_ban 필드의 의미가 '관심 관계가 차단됨'이라면 이 메서드는
     * '일반적인 사용자 차단'을 확인하는 용도로 적합하지 않을 수 있습니다.
     * 여기서는 제공된 스키마에 맞춰 '관심 관계에서 is_ban이 true인 경우'를 가정합니다.
     * 일반적인 사용자 차단 기능이 필요하다면 별도 `Block` 모델을 고려해야 합니다.
     *
     * @param {BigInt} blockerId - 차단하는 사용자 (Service)의 BigInt ID
     * @param {BigInt} blockedId - 차단당한 사용자 (Service)의 BigInt ID
     * @returns {Promise<boolean>} - 차단 관계가 존재하고 is_ban이 true이면 true, 아니면 false
     */
    static async isBlocked(blockerId, blockedId) {
        const blockedRelation = await prisma.interest.findUnique({
            where: {
                unique_interest_pair: {
                    sender_id: blockerId,
                    recipient_id: blockedId,
                }
            },
            select: { is_ban: true }
        })
        return blockedRelation?.is_ban === true
    }

    /**
     * 네트워크 요청을 생성합니다.
     * @param {BigInt} senderId - 요청을 보내는 사용자 Service ID
     * @param {BigInt} recipientId - 요청을 받는 사용자 Service ID
     * @returns {Promise<Object>} 생성된 Network 레코드
     */
    static async createNetworkRequest(senderId, recipientId) {
        return prisma.network.create({
            data: {
                sender_id: senderId,
                recipient_id: recipientId,
                status: NetworkStatus.PENDING,
            },
        })
    }

    /**
     * 특정 네트워크 요청을 ID로 조회합니다.
     * @param {BigInt} requestId - Network 테이블의 ID
     * @returns {Promise<Object|null>} Network 레코드 또는 null
     */
    static async findNetworkRequestById(networkId) {
        return prisma.network.findUnique({
            where: { id: networkId },
        });
    }

    /**
     * 특정 네트워크 요청의 상태('PENDING' 에서 'ACCEPTED' 또는 'REJECTED'로)를 업데이트합니다.
     * @param {BigInt} networkId - Network 테이블의 ID
     * @param {NetworkStatus} newStatus - 변경할 상태 ('ACCEPTED', 'REJECTED')
     * @returns {Promise<Object>} 업데이트된 Network 레코드
     */
    static async updateNetworkRequestStatus(networkId, newStatus) {
        return prisma.network.update({
            where: { id: networkId },
            data: {
                status: newStatus,
                updatedAt: new Date(),
            },
        })
    }

    /**
     * 특정 네트워크 연결을 삭제합니다.
     * @param {BigInt} networkId - Network 테이블의 ID
     * @returns {Promise<Object>} 삭제된 Network 레코드
     */
    static async deleteNetworkConnection(networkId) {
        return prisma.network.delete({
            where: { id: networkId },
        })
    }

    /**
     * 특정 사용자의 ACCEPTED 상태 네트워크 연결 목록을 조회합니다.
     * @param {BigInt} userId - 사용자 Service ID
     * @returns {Promise<Array<Object>>}
     */
    static async findNetworkConnections(userId) {
        return await prisma.network.findMany({
            where: {
                OR: [
                    { sender_id: userId, status: NetworkStatus.ACCEPTED },
                    { recipient_id: userId, status: NetworkStatus.ACCEPTED },
                ],
            },
            include: {
                sender: { select: { id: true, name: true, profile_img: true } },
                recipient: { select: { id: true, name: true, profile_img: true } },
            },
        })
    }

    /**
     * 특정 사용자가 보낸 PENDING 상태 네트워크 요청 목록을 조회합니다.
     * @param {BigInt} senderId - 요청을 보낸 사용자 Service ID
     * @returns {Promise<Array<Object>>}
     */
    static async findSentNetworkRequests(senderId) {
        return prisma.network.findMany({
            where: {
                sender_id: senderId,
                status: NetworkStatus.PENDING,
            },
            include: {
                recipient: { select: { id: true, name: true, profile_img: true } },
            },
        })
    }

    /**
     * 두 서비스 ID 간의 기존 네트워크 관계를 조회합니다.
     * @param {BigInt} serviceId1
     * @param {BigInt} serviceId2
     * @returns {Promise<Object|null>} Network 레코드 또는 null
     */
    static async findExistingNetwork(serviceId1, serviceId2) {
        return prisma.network.findFirst({
            where: {
                OR: [
                    { sender_id: serviceId1, recipient_id: serviceId2 },
                    { sender_id: serviceId2, recipient_id: serviceId1 },
                ],
            },
        })
    }

    /**
     * 특정 사용자에게 받은 PENDING 상태 네트워크 요청 목록을 조회합니다.
     * @param {BigInt} recipientId - 요청을 받은 사용자 Service ID
     * @returns {Promise<Array<Object>>} 받은 네트워크 요청 목록 배열
     */
    static async findReceivedNetworkRequests(recipientId) {
        return prisma.network.findMany({
            where: {
                recipient_id: recipientId,
                status: NetworkStatus.PENDING,
            },
            include: {
                sender: { // 요청을 보낸 서비스의 정보 포함
                    select: {
                        id: true,
                        name: true,
                        profile_img: true,
                    },
                },
            },
        })
    }

    /**
     * 두 서비스 ID 간의 네트워크 관계를 상세하게 조회합니다. (상태 포함)
     * @param {BigInt} serviceId1 - 첫 번째 서비스의 BigInt ID
     * @param {BigInt} serviceId2 - 두 번째 서비스의 BigInt ID
     * @returns {Promise<Object|null>} Network 레코드 또는 null
     */
    static async findSpecificNetworkStatus(serviceId1, serviceId2) {
        return prisma.network.findFirst({
            where: {
                OR: [
                    { sender_id: serviceId1, recipient_id: serviceId2 },
                    { sender_id: serviceId2, recipient_id: serviceId1 },
                ],
            },
            // 필요한 경우 sender/recipient 정보도 include 할 수 있음
            // include: {
            //     sender: { select: { id: true, name: true, profile_img: true } },
            //     recipient: { select: { id: true, name: true, profile_img: true } },
            // },
        })
    }

    /**
     * 특정 사용자의 ACCEPTED 상태 네트워크 연결 수를 카운트합니다.
     * @param {BigInt} serviceId - 네트워크 연결 수를 조회할 사용자 (Service)의 BigInt ID
     * @returns {Promise<number>} 네트워크 연결 수
     */
    static async countNetworkConnections(serviceId) {
        return prisma.network.count({
            where: {
                status: NetworkStatus.ACCEPTED,
                OR: [
                    { sender_id: serviceId },
                    { recipient_id: serviceId },
                ],
            },
        })
    }

    /**
     * 특정 사용자가 다른 사용자를 차단했는지 확인합니다.
     * @param {BigInt} blockerId - 차단하는 사용자 (Service)의 BigInt ID
     * @param {BigInt} blockedId - 차단당한 사용자 (Service)의 BigInt ID
     * @returns {Promise<Object | null>} Block 레코드 또는 null
     */
    static async findBlock(blockerId, blockedId) {
        return prisma.userBlock.findUnique({
            where: {
                unique_user_block: { // Prisma 복합 유니크 키 사용
                    blocker_id: blockerId,
                    blocked_id: blockedId,
                },
            },
        })
    }

    /**
     * 사용자를 차단합니다.
     * @param {BigInt} blockerId - 차단하는 사용자 (Service)의 BigInt ID
     * @param {BigInt} blockedId - 차단당한 사용자 (Service)의 BigInt ID
     * @returns {Promise<Object>} 생성된 Block 레코드
     */
    static async createBlock(blockerId, blockedId) {
        return prisma.userBlock.create({
            data: {
                blocker_id: blockerId,
                blocked_id: blockedId,
            },
        })
    }

    /**
     * 사용자의 차단을 해제합니다.
     * @param {BigInt} blockerId - 차단을 해제하는 사용자 (Service)의 BigInt ID
     * @param {BigInt} blockedId - 차단당했던 사용자 (Service)의 BigInt ID
     * @returns {Promise<Object>} 삭제된 Block 레코드
     */
    static async deleteBlock(blockerId, blockedId) {
        return prisma.userBlock.delete({
            where: {
                unique_user_block: {
                    blocker_id: blockerId,
                    blocked_id: blockedId,
                },
            },
        })
    }

    /**
     * 두 사용자 ID가 서로 차단 관계에 있는지 확인합니다.
     * @param {BigInt} serviceId1 - 첫 번째 서비스 ID
     * @param {BigInt} serviceId2 - 두 번째 서비스 ID
     * @returns {Promise<{ isBlockedBy1: boolean, isBlockedBy2: boolean }>} 각 방향의 차단 여부
     */
    static async areUsersBlocked(serviceId1, serviceId2) {
        const block1to2 = await prisma.userBlock.count({
            where: {
                blocker_id: serviceId1,
                blocked_id: serviceId2,
            },
        })

        const block2to1 = await prisma.userBlock.count({
            where: {
                blocker_id: serviceId2,
                blocked_id: serviceId1,
            },
        })

        return { isBlockedBy1: block1to2 > 0, isBlockedBy2: block2to1 > 0 }
    }

    /**
     * 특정 사용자가 차단한 사용자 목록을 조회합니다.
     * @param {BigInt} blockerId - 차단한 사용자 (Service)의 BigInt ID
     * @returns {Promise<Array<Object>>} 차단한 사용자 목록 배열
     */
    static async findBlockedUsers(blockerId) {
        return prisma.userBlock.findMany({
            where: {
                blocker_id: blockerId,
            },
            include: {
                blocked: { // 차단당한 서비스의 정보 포함
                    select: {
                        id: true,
                        name: true,
                        profile_img: true,
                    },
                },
            },
        })
    }
}
export default RelationshipsModel