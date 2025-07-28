import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js';
import { NotFoundError, InternalServerError } from '../../middlewares/error.js';

const prisma = new PrismaClient();

class Search {
    static async searchUsers(name, lastProfileId, limit) {
        try {
            const searchQuery = {
                where: {
                    id: BigInt(serviceId),
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                select: {
                    id: true,
                    name: true,
                    low_sector: true,
                    profile_img: true
                    // 나이를 어떻게 하지... 하...
                },
                orderBy: {
                    id: 'desc'
                },
                take: limit,
            };

            if (lastFeedId !== null) {
                queryOptions.cursor = { id: BigInt(lastFeedId) };
                queryOptions.skip = 1;
            }

            const users = await prisma.service.findMany(searchQuery);
            const processedUsers = users.map(user => ({
                user_id: user.id,
                name: user.name,
                sector: user.low_sector,
                profile_img: user.profile_img
            }));

            return convertBigIntsToNumbers(processedUsers);
        } catch (error) {
            console.error('유저 검색 중 오류 발생:', error);
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default Search;