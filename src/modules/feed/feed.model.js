// models/Feed.js

/*
TODO
1. 하드 삭제 구현하기 -> FeedImage, FeedComment, FeedHeart에 외래키 제약 조건 걸기, onDelete: Cascade
*/

import { PrismaClient } from '@prisma/client';
import { convertBigIntsToNumbers } from '../utils/dataTransformer.js';

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
    static async findAll(limit = 10, lastFeedId = null) {
        try {
            const queryOptions = {
                where: {
                    is_visible: true,
                },
                include: {
                    FeedImage: {
                        select: {
                            id: true,
                            image_url: true,
                            created_at: true
                        }
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
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
                            FeedComment: true
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
                queryOptions.cursor = {
                    id: BigInt(lastFeedId)
                };
                queryOptions.skip = 1; // 커서 자신은 결과에서 제외

                queryOptions.where = {
                    AND: [
                        queryOptions.where, // 기존 is_visible: true 조건 유지
                        {
                            id: { lt: BigInt(lastFeedId) } // lastFeedId보다 작은 ID의 피드들을 조회 (더 과거의 피드)
                        }
                    ]
                };
            }

            const feeds = await prisma.feed.findMany(queryOptions);

            const feedsWithCommentCount = feeds.map(feed => ({
                ...feed,
                commentCount: feed._count.FeedComment
            }));

            return convertBigIntsToNumbers(feedsWithCommentCount);
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
}

export default Feed;