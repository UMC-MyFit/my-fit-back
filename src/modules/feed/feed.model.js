// models/Feed.js

/*
TODO
1. 하드 삭제 구현하기 -> FeedImage, FeedComment, FeedHeart에 외래키 제약 조건 걸기, onDelete: Cascade
*/

import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers, stringToList } from '../../libs/dataTransformer.js';

const prisma = new PrismaClient();

class Feed {
    // 피드 생성
    static async create(feedData) {
        try {
            const result = await prisma.$transaction(async (prisma) => {
                const newFeed = await prisma.feed.create({
                    data: {
                        feed_text: feedData.feed_text,
                        hashtag: feedData.hashtag || '',
                        heart: 0,
                        service_id: BigInt(feedData.service_id),
                        is_visible: true
                    }
                });

                if (feedData.images && feedData.images.length > 0) {
                    const imagePromises = feedData.images.map(imageUrl =>
                        prisma.feedImage.create({
                            data: {
                                image_url: imageUrl,
                                feed_id: newFeed.id
                            }
                        })
                    );
                    await Promise.all(imagePromises);
                }

                return convertBigIntsToNumbers({ id: newFeed.id });
            });

            return result;
        } catch (error) {
            console.error('피드 생성 중 데이터베이스 오류:', error);
            throw error;
        }
    }

    // 전체 피드 목록 조회
    static async findAll(serviceId, lastFeedId = null, limit = 10) {
        try {
            const queryOptions = {
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
                orderBy: [
                    { id: 'desc' }
                ],
                take: limit,
            };

            // 커서 기반 페이지네이션
            if (lastFeedId !== null) {
                queryOptions.cursor = { id: BigInt(lastFeedId) };
                queryOptions.skip = 1;
            }


            const feeds = await prisma.feed.findMany(queryOptions);
            const processedFeeds = feeds.map(feed => {
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
            });

            return convertBigIntsToNumbers(processedFeeds);
        } catch (error) {
            console.error('전체 피드 목록 조회 중 오류:', error);
            throw error;
        }
    }

    // 피드 삭제 -> 소프트 삭제(숨김처리)
    static async hide(id) {
        try {
            const hidedFeed = await prisma.feed.update({
                where: {
                    id: BigInt(id)
                },
                data: {
                    is_visible: false,
                    updated_at: new Date()
                }
            });

            return convertBigIntsToNumbers(hidedFeed);
        } catch (error) {
            console.error('피드 삭제 중 오류:', error);
            throw error;
        }
    }

    // 특정 사용자가 작성한 피드만 조회
    static async findFeedsByServiceId(serviceId, authenticatedUserId, limit = 10, cursor = null) {
        try {
            const whereClause = {
                service_id: serviceId,
                is_visible: true
            }

            if (cursor) {
                whereClause.id = { lt: cursor } // 다음 페이지를 위한 cursor 기반 페이징
            }

            const feeds = await prisma.feed.findMany({
                where: whereClause,
                take: limit,
                orderBy: {
                    id: 'desc', // 최신 피드가 먼저 오도록 내림차순 정렬
                },
                include: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                            profile_img: true,
                        },
                    },
                    FeedImage: {
                        select: { image_url: true },
                        orderBy: { id: 'asc' }, // 이미지 순서 보장
                    },
                    feedHearts: {
                        select: { id: true, service_id: true }, // 좋아요 수 카운트용
                    },
                    _count: {
                        select: { FeedComment: true, feedHearts: true },
                    },
                },
            })

            // 현재 사용자가 해당 피드에 '좋아요'를 눌렀는지 여부 판단 (추가 기능이라면)
            // 현재 로그인한 사용자의 serviceId를 받아와서 is_liked 필드를 추가할 수 있습니다.
            // 여기서는 일반 조회이므로 is_liked 로직은 빼거나, MypageService에서 처리하도록 합니다.
            const processedFeeds = feeds.map((feed) => {
                const imageUrls = feed.FeedImage.map((img) => img.image_url)
                const is_liked = feed.feedHearts.some(
                    (heart) => heart.service_id === BigInt(authenticatedUserId)
                );
                return {
                    feed_id: feed.id,
                    user: {
                        id: feed.service.id,
                        name: feed.service.name,
                        sector: feed.service.sector,
                        profile_img: feed.service.profile_img,
                    },
                    created_at: feed.created_at,
                    images: imageUrls,
                    feed_text: feed.feed_text,
                    hashtags: feed.hashtag,
                    heart: feed._count.feedHearts,
                    is_liked: is_liked,
                    comment_count: feed._count.FeedComment,
                }
            })

            return convertBigIntsToNumbers(processedFeeds)
        } catch (error) {
            console.error('사용자 피드 조회 중 오류:', error)
            throw error
        }
    }
    static async uploadRecentHashtags(serviceId, hashtags) {
        try {
            const hashtagPromises = hashtags.map(async hashtag => {
                const existingHashtag = await prisma.RecentHashtag.findFirst({
                    where: {
                        hashtag: hashtag,
                    }
                });
                if (!existingHashtag) {
                    await prisma.RecentHashtag.create({
                        data: {
                            hashtag: hashtag,
                            service_id: BigInt(serviceId)
                        }
                    })
                }
            });
            await Promise.all(hashtagPromises);
        } catch (error) {
            console.error('최근 해시태그 생성 중 오류:', error);
            throw error;
        }
    }
}

export default Feed;