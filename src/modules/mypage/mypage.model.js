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

                    division: true,
                    grade_status: true,
                    created_at: true,
                    updated_at: true,
                    is_profile_completed: true,
                },
            });
            // 조회된 사용자가 있다면 BigInt 값을 Number로 변환하여 반환
            return userProfile ? convertBigIntsToNumbers(userProfile) : null;
        } catch (error) {
            console.error('MypageModel - 사용자 프로필 조회 중 오류:', error);
            throw error;
        }
    }
}

export default MypageModel;