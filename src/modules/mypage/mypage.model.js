import prismaPkg from '@prisma/client';
const { PrismaClient, NetworkStatus } = prismaPkg;
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';
const prisma = new PrismaClient();

class MypageModel {
    /**
     * @param {BigInt} serviceId - 조회할 사용자의 ID (BigInt 타입)
     * @returns {Promise<Object | null>} 사용자 프로필 객체 또는 null (찾지 못했을 경우)
     */
    static async findUserProfileById(serviceId) {
        try {
           const userDBEntry = await prisma.userDB.findFirst({
                where: {
                    service_id: serviceId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            one_line_profile: true,
                            Highest_grade: true,
                            link: true,
                            inc_AuthN_file: true,
                            division: true,
                            grade_status: true,
                            industry: true,
                            team_division: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            recruiting_status: true,
                            profile_img: true,
                            high_sector: true,
                            low_sector: true,
                            userAreas: {
                                select: {
                                    high_area: true,
                                    low_area: true,
                                }
                            }
                        },
                    },
                },
            })

            if (userDBEntry) {
                const serviceData = userDBEntry.service;
                const userData = userDBEntry.user;

                // 서비스 및 사용자 정보를 조합한 객체 반환
                const combinedProfileData = {
                    service: serviceData,
                    user: userData
                }

                return convertBigIntsToNumbers(combinedProfileData)

            } else {
                console.log("해당 service_id를 가진 사용자 또는 서비스를 찾을 수 없습니다.")
            }
        } catch (error) {
            console.error("사용자 프로필 정보 조회 중 오류:", error)
        }
    }

    /**
     * 프로필 사진을 업데이트합니다.
     * User가 연결된 Service 모델의 profile_img를 업데이트합니다.
     * @param {BigInt} serviceId - 프로필 사진을 수정할 사용자의 ID
     * @param {string} profileImgUrl - 새로운 프로필 사진 URL
     * @returns {Promise<Object>} 업데이트된 서비스 프로필 정보 (업데이트된 service_id와 profile_img 반환)
     */
    static async updateProfilePicture(serviceId, profileImgUrl) {
        try {
            const updatedProfileImg = await prisma.service.update({
                where: {
                    id : serviceId
                },
                data: {
                    profile_img: profileImgUrl,
                    updated_at: new Date()
                }
            })
            return convertBigIntsToNumbers(updatedProfileImg)
        } catch (error) {
            console.error(`MypageModel - 사용자 ID ${serviceId}의 프로필 사진 업데이트 중 오류:`, error)
            throw error
        }
    }

    /**
     * 서비스의 recruiting_status를 업데이트합니다.
     * @param {BigInt} serviceId - 관련 서비스를 소유한 사용자의 ID
     * @param {string} newStatus - 업데이트할 새로운 모집 상태 값
     * @returns {Promise<Object | null>} 업데이트된 서비스 정보 또는 null
     */
    static async updateRecruitingStatus(serviceId, newStatus) {
        try {
            const updatedService = await prisma.service.update({
                where: {
                    id: serviceId,
                },
                data: {
                    recruiting_status: newStatus,
                    updated_at: new Date(), 
                },
                select: { 
                    id: true,
                    recruiting_status: true,
                }
            });

            // 3. 업데이트된 서비스 정보를 반환합니다.
            return convertBigIntsToNumbers({
                service_id: serviceId, // 사용자 ID도 함께 반환하여 서비스 계층에서 활용할 수 있도록 함
                recruiting_status: updatedService.recruiting_status,
            })

        } catch (error) {
            console.error(`MypageModel - 사용자 ID ${serviceId}의 recruiting_status 업데이트 중 오류:`, error);
            throw error;
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
}

export default MypageModel;