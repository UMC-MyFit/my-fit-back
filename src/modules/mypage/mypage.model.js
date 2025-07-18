// src/modules/mypage/mypage.model.js

import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';

const prisma = new PrismaClient();

class MypageModel {
    /**
     *
     * @param {BigInt} userId - 조회할 사용자의 ID (BigInt 타입)
     * @returns {Promise<Object | null>} 사용자 프로필 객체 또는 null (찾지 못했을 경우)
     */
    static async findUserProfileById(userId) {
        try {
            // 사용자 프로필 조회 쿼리
            const userProfile = await prisma.user.findUnique({
                where: {
                    id: userId, // BigInt 타입으로 전달
                },
                select: {
                    id: true,
                    name: true,
                    one_line_profile: true,
                    birth_date: true,
                    Highest_grade: true,
                    link: true,
                    email: true,
                    platform: true,
                    is_email_AuthN: true,
                    inc_AuthN_file: true,
                    password: true,
                    division: true,
                    grade_status: true,
                    created_at: true,
                    updated_at: true,
                    is_profile_completed: true,
                    userDBs: { // UserDB 관계를 통해 연결된 Service 정보 가져오기
                        select: {
                            service: {
                                select: {
                                    id: true,
                                    profile_img: true // Service 모델의 profile_img
                                }
                            }
                        }
                    }
                },
            });

            // 조회된 사용자가 있다면 BigInt 값을 Number로 변환하여 반환
            // userDBs를 통해 가져온 service의 profile_img도 함께 반환하도록 처리
            if (userProfile) {
                const transformedUser = convertBigIntsToNumbers(userProfile);
                // 연결된 서비스의 프로필 이미지들을 별도로 포함
                transformedUser.associated_service_profile_images = transformedUser.userDBs.map(udb => ({
                    service_id: udb.service.id,
                    profile_img: udb.service.profile_img
                }));
                delete transformedUser.userDBs; // 원본 userDBs 필드는 삭제
                return transformedUser;
            }
            return null;

        } catch (error) {
            console.error('MypageModel - 사용자 프로필 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * 프로필 사진을 업데이트합니다.
     * User가 연결된 Service 모델의 profile_img를 업데이트합니다.
     * @param {BigInt} userId - 프로필 사진을 수정할 사용자의 ID
     * @param {string} profileImgUrl - 새로운 프로필 사진 URL
     * @returns {Promise<Object>} 업데이트된 서비스 프로필 정보 (업데이트된 service_id와 profile_img 반환)
     */
    static async updateProfilePicture(userId, profileImgUrl) {
        try {
            // 1. 해당 userId와 연결된 모든 service_id를 UserDB 테이블에서 조회
            const userServices = await prisma.userDB.findMany({
                where: {
                    user_id: userId,
                },
                select: {
                    service_id: true,
                },
            });

            // 연결된 service_id가 없으면 오류를 던지거나 빈 배열 반환
            if (userServices.length === 0) {
                console.warn(`MypageModel - 사용자 ID ${userId}와 연결된 서비스가 없습니다.`);
                // 클라이언트에게 특정 오류를 알리기 위해 NotFoundError 등을 던질 수 있습니다.
                // 현재 호출 스택을 고려하여 에러를 상위로 던집니다.
                // 예를 들어 throw new CustomError('S002', 404, '사용자와 연결된 서비스를 찾을 수 없습니다.');
                return null;
            }

            const serviceIdsToUpdate = userServices.map(us => us.service_id);

            // 2. 조회된 service_id들을 사용하여 Service 모델의 profile_img를 업데이트
            // updateMany를 사용하여 여러 서비스를 한 번에 업데이트
            const updateResult = await prisma.service.updateMany({
                where: {
                    id: {
                        in: serviceIdsToUpdate, // 이 서비스 ID들에 해당하는 모든 Service 레코드 업데이트
                    },
                },
                data: {
                    profile_img: profileImgUrl,
                    updated_at: new Date(),
                },
            });

            // 3. 업데이트된 Service 정보 조회 (필요한 경우)
            // updateMany는 업데이트된 레코드의 수를 반환하므로, 업데이트된 데이터를 가져오려면 다시 조회해야 합니다.
            const updatedServices = await prisma.service.findMany({
                where: {
                    id: {
                        in: serviceIdsToUpdate,
                    },
                },
                select: {
                    id: true,
                    profile_img: true,
                },
            });

            // BigInt 값을 Number로 변환
            const transformedServices = updatedServices.map(service => convertBigIntsToNumbers(service));

            console.log(`MypageModel - ${updateResult.count}개의 서비스 프로필 사진이 업데이트되었습니다.`);
            // 컨트롤러가 user_id와 profile_img를 기대하므로, 첫 번째 서비스의 ID를 user_id로 반환 (예시)
            // 실제로는 업데이트된 서비스 목록을 반환하는 것이 더 정확할 수 있습니다.
            // 여기서는 컨트롤러의 기대치에 맞춰 첫 번째 서비스의 정보를 반환합니다.
            if (transformedServices.length > 0) {
                return {
                    user_id: userId.toString(), // 사용자의 ID를 문자열로 반환
                    profile_img: transformedServices[0].profile_img, // 업데이트된 첫 번째 서비스의 프로필 이미지 반환
                    updated_services: transformedServices // 모든 업데이트된 서비스 정보 (디버깅 또는 상세 응답용)
                };
            }
            return null; // 업데이트된 서비스가 없을 경우

        } catch (error) {
            console.error(`MypageModel - 사용자 ID ${userId}의 프로필 사진 업데이트 중 오류:`, error);
            throw error; // 에러를 상위 호출자로 다시 던집니다.
        }
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
        });
    }

    /**
     * 특정 sender와 recipient 간의 관심 관계를 조회합니다.
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
        });
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
        });
    }

    /**
     * 기존 관심 관계를 삭제합니다.
     * @param {BigInt} senderId - 관심을 보낸 Service의 BigInt ID
     * @param {BigInt} recipientId - 관심을 받은 Service의 BigInt ID
     * @returns {Promise<Object>} - 삭제된 Interest 객체
     */
    static async deleteInterest(senderId, recipientId) {
        // deleteMany를 사용하지만, unique 제약 조건이 있으므로 최대 1개만 삭제됩니다.
        // delete를 사용하려면 @unique에 추가로 @id를 붙여야 할 수도 있습니다.
        // 여기서는 기존 unique_interest_pair를 활용하여 delete를 사용합니다.
        return await prisma.interest.delete({
            where: {
                unique_interest_pair: {
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
        });
        return blockedRelation?.is_ban === true;
    }
}

export default MypageModel;