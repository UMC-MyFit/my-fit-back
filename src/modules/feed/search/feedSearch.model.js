import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers, isKeywordContentSimilar, stringToList } from '../../../libs/dataTransformer.js';
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
    static async searchFeedsByKeyword(keyword, lastFeedId, serviceId, limit = 100) {
        try {
            const searchQuery = {
                where: {
                    is_visible: true,
                },
                select: {
                    id: true,
                    created_at: true,
                    feed_text: true,
                    hashtag: true,

                    FeedImage: {
                        select: {
                            image_url: true
                        }
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            low_sector: true,
                            profile_img: true
                        }
                    },
                    feedHearts: {
                        select: {
                            service_id: true
                        }
                    },
                    _count: {
                        select: {
                            FeedComment: true,
                            feedHearts: true
                        }
                    }
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
                    const imageUrls = feed.FeedImage.map(image => image.image_url)
                    const is_liked = feed.feedHearts.some(
                        (heart) => heart.service_id === BigInt(serviceId)
                    );
                    const hashtags = stringToList(feed.hashtag);
                    return {
                        "feed_id": feed.id,
                        "user": {
                            "id": feed.service.id,
                            "name": feed.service.name,
                            "sector": feed.service.low_sector,
                            "profile_img": feed.service.profile_img
                        },
                        "created_at": feed.created_at,
                        "images": imageUrls,
                        "feed_text": feed.feed_text,
                        "hashtags": hashtags,
                        "heart": feed._count.feedHearts,
                        "is_liked": is_liked,
                        "comment_count": feed._count.FeedComment
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
    static async searchFeedsByHashtag(keyword, lastFeedId, serviceId, limit = 30) {
        try {
            console.log("Searching feeds by hashtag:", keyword);
            const searchQuery = {
                where: {
                    is_visible: true,
                    hashtag: {
                        contains: keyword,
                    }
                },
                select: {
                    id: true,
                    created_at: true,
                    feed_text: true,
                    hashtag: true,

                    FeedImage: {
                        select: {
                            image_url: true
                        }
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            low_sector: true,
                            profile_img: true
                        }
                    },
                    feedHearts: {
                        select: {
                            service_id: true
                        }
                    },
                    _count: {
                        select: {
                            FeedComment: true,
                            feedHearts: true
                        }
                    }
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
            const processedFeeds = feeds.map(async feed => {
                const listHashtags = stringToList(feed.hashtag);
                if (listHashtags.includes(keyword)) {
                    const imageUrls = feed.FeedImage.map(image => image.image_url)
                    const is_liked = feed.feedHearts.some(
                        (heart) => heart.service_id === BigInt(serviceId)
                    );
                    const hashtags = stringToList(feed.hashtag);
                    return {
                        "feed_id": feed.id,
                        "user": {
                            "id": feed.service.id,
                            "name": feed.service.name,
                            "sector": feed.service.low_sector,
                            "profile_img": feed.service.profile_img
                        },
                        "created_at": feed.created_at,
                        "images": imageUrls,
                        "feed_text": feed.feed_text,
                        "hashtags": hashtags,
                        "heart": feed._count.feedHearts,
                        "is_liked": is_liked,
                        "comment_count": feed._count.FeedComment
                    };
                }
                return null;
            });

            const resultsRaw = await Promise.all(processedFeeds);
            const resultFeeds = resultsRaw.filter(feed => feed !== null);

            return convertBigIntsToNumbers(resultFeeds);
        } catch (error) {
            console.error('해시태그로 피드 검색 중 오류 발생:', error);
            throw new InternalServerError({ originalError: error.message });
        }
    }
    static async searchSimilarHashtags(keyword, lastHashtagId, limit = 10) {
        try {
            const searchQuery = {
                where: {
                    hashtag: {
                        contains: keyword,
                        //mode: 'insensitive'
                    }
                },
                select: {
                    id: true,
                    hashtag: true
                },
                orderBy: {
                    id: 'desc'
                },
                take: limit,
            };

            if (lastHashtagId !== null) {
                searchQuery.cursor = { id: BigInt(lastHashtagId) };
                searchQuery.skip = 1;
            }

            const hashtags = await prisma.recentHashtag.findMany(searchQuery);
            const processedHashtags = hashtags.map(hashtag => ({
                hashtag_id: hashtag.id,
                hashtag: hashtag.hashtag
            }));

            return convertBigIntsToNumbers(processedHashtags);
        } catch (error) {
            console.error('해시태그 검색 중 오류 발생:', error);
            throw new InternalServerError({ originalError: error.message });
        }
    }
}

export default Search;