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
}

export default MypageModel;