import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers, isKeywordContentSimilar } from '../../../libs/dataTransformer.js';
import { NotFoundError, InternalServerError } from '../../../middlewares/error.js';

const prisma = new PrismaClient();

class Search {
    static async searchUsers(name, lastProfileId, limit) {
        try {
            const searchQuery = {
                where: {
                    name: {
                        contains: name,
                    }
                },
                select: {
                    id: true,
                    name: true,
                    low_sector: true,
                    profile_img: true
                },
                orderBy: {
                    id: 'desc'
                },
                take: limit,
            };

            if (lastProfileId !== null) {
                queryOptions.cursor = { id: BigInt(lastProfileId) };
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
    static async searchFeedsByKeyword(keyword, lastFeedId, limit = 100) {
        try {
            const searchQuery = {
                where: {
                    is_visible: true,
                },
                select: {
                    id: true,
                    feed_text: true,
                    FeedImage: {
                        select: {
                            image_url: true
                        }
                    },
                },
                orderBy: {
                    id: 'desc'
                },
                take: limit,
            };

            if (lastFeedId !== null) {
                searchQuery.cursor = { id: BigInt(lastFeedId) };
                searchQuery.skip = 1;
            }
            const feeds = await prisma.feed.findMany(searchQuery);
            const resultsPromises = feeds.map(async (feed) => {
                const isSimilar = await isKeywordContentSimilar(keyword, feed.feed_text);
                if (isSimilar) {
                    return {
                        feed_id: feed.id,
                        feed_text: feed.feed_text,
                        images: feed.FeedImage ? feed.FeedImage.map(image => image.image_url) : [] // FeedImage가 없을 경우를 대비
                    };
                }
                return null;
            });
            const resultsRaw = await Promise.all(resultsPromises);
            const processedFeeds = resultsRaw.filter(feed => feed !== null);
            return convertBigIntsToNumbers(processedFeeds);
        } catch (error) {
            console.error('피드 검색 중 오류 발생:', error);
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default Search;