import { Prisma, PrismaClient } from '@prisma/client'
import redisClient from '../../libs/redisClient.js'
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
    NotFoundError,
} from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const usersService = {
    updateBusinessLicense: async (serviceId, inc_AuthN_file) => {
        // 1. UserDB 찾기
        const userDB = await prisma.userDB.findFirst({
            where: { service_id: BigInt(serviceId) },
            select: { user_id: true, service_id: true },
        })
        if (!userDB) {
            throw new NotFoundError('해당 서비스의 사용자를 찾을 수 없습니다.')
        }

        // 2. 유저 존재 확인
        const user = await prisma.user.findUnique({
            where: { id: userDB.user_id },
            select: { id: true, division: true }
        })
        if (!user) {
            throw new NotFoundError('유저를 찾을 수 없습니다.')
        }

        // 3. 기업 회원인지 확인
        if (user.division !== 'team') {
            throw new BadRequestError('사업자 등록증은 기업 회원만 등록할 수 있습니다.')
        }

        // 4. inc_AuthN_file 업데이트
        await prisma.user.update({
            where: { id: user.id },
            data: { inc_AuthN_file }
        })

        // 5. 해당 서비스의 is_inc_AuthN을 true로 변경
        await prisma.service.update({
            where: { id: userDB.service_id },
            data: { is_inc_AuthN: true },
        })

        return convertBigIntsToNumbers({
            service_id: userDB.service_id,
            inc_AuthN_file,
        })

    },

    resetPassword: async ({ email, authCode, newPassword }) => {
        // 1. 이메일 존재 여부 확인
        const user = await prisma.user.findFirst({
            where: {
                email,
                platform: 'local',
            },
        })
        if (!user) {
            const otherPlatformUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: {
                        platform: 'local'
                    }
                }
            })
            if (otherPlatformUser) {
                throw new ConflictError('소셜 로그인으로 가입된 회원은 비밀번호 재설정이 불가능합니다.')
            }
            throw new NotFoundError('가입되지 않은 이메일입니다.')
        }

        // 2. Redis에서 이메일 인증 코드 확인
        const storedCode = await redisClient.get(`authCode:${email}`)
        if (!storedCode || storedCode !== authCode) {
            throw new BadRequestError('인증코드가 유효하지 않습니다.')
        }

        // 3. 비밀번호 유효성 검사
        if (newPassword.length < 6) {
            throw new BadRequestError('비밀번호는 최소 6자 이상이어야 합니다.')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)
        // 4. 비밀번호 재설정 (나중에 bcrpt 적용 예정)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        })

        // 5. Redis에서 인증번호 삭제
        await redisClient.del(`authCode:${email}`)
    },

    verifyCode: async (email, authCode) => {
        const storedCode = await redisClient.get(`authCode:${email}`)
        console.log(`storedCode: ${storedCode}, inputCode: ${authCode}`)
        if (!storedCode || storedCode !== authCode) {
            throw new BadRequestError('인증코드가 유효하지 않습니다.')
        }
    },
    verifyUser: async (email, password, authCode) => {
        // 1. 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new BadRequestError('유효하지 않은 이메일 형식입니다.')
        }

        // 2. 비밀번호 길이 검증
        if (password.length < 6) {
            throw new BadRequestError('비밀번호가 유효하지 않습니다.')
        }

        // 3. Redis 연결 및 인증코드 검증
        if (!redisClient.isOpen) {
            try {
                await redisClient.connect()
            } catch (error) {
                console.log('Redis 연결 실패:', error)
                throw new InternalServerError('redis 연결 실패')
            }
        }

        const storedCode = await redisClient.get(`authCode:${email}`)
        if (!storedCode || storedCode !== authCode) {
            throw new BadRequestError('인증코드가 유효하지 않습니다.')
        }

        // 4. 이메일 중복 확인
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })
        if (existingUser) {
            throw new ConflictError('이미 회원가입된 이메일입니다.')
        }

        // 5. 인증코드 삭제
        await redisClient.del(`authCode:${email}`)

        console.log('이메일/비밀번호/인증코드 검증 완료')
    },
    deleteUser: async (myServiceId) => {
        return prisma.$transaction(async (tx) => {
            const svcId = BigInt(myServiceId)

            // 0) 기본 정보
            const myUserDB = await tx.userDB.findFirst({
                where: { service_id: svcId },
                select: { id: true, user_id: true },
            })
            if (!myUserDB) {
                throw new Error('UserDB가 존재하지 않습니다')
            }
            const myUserId = myUserDB.user_id

            // 1) 내가 가진 피드들 ID
            const myFeeds = await tx.feed.findMany({
                where: { service_id: svcId },
                select: { id: true },
            })
            const myFeedIds = myFeeds.map((f) => f.id)

            // 2) 내 피드에 달린 모든 댓글/하트/이미지 삭제
            if (myFeedIds.length > 0) {
                await tx.feedComment.deleteMany({ where: { feed_id: { in: myFeedIds } } })
                await tx.feedHeart.deleteMany({ where: { feed_id: { in: myFeedIds } } })
                await tx.feedImage.deleteMany({ where: { feed_id: { in: myFeedIds } } })
            }

            // 3) 내가 남의 피드에 단 댓글 + 그 대댓글 삭제
            const myComments = await tx.feedComment.findMany({
                where: { service_id: svcId },
                select: { id: true },
            })
            const myCommentIds = myComments.map((c) => c.id)
            if (myCommentIds.length > 0) {
                await tx.feedComment.deleteMany({
                    where: {
                        OR: [
                            { id: { in: myCommentIds } },                    // 내 댓글
                            { high_comment_id: { in: myCommentIds } },       // 내 댓글에 달린 대댓글
                        ],
                    },
                })
            }

            // 4) 내가 남의 피드에 누른 하트 삭제
            await tx.feedHeart.deleteMany({ where: { service_id: svcId } })

            // 5) 최근 해시태그
            await tx.recentHashtag.deleteMany({ where: { service_id: svcId } })

            // 6) 활동카드/키워드 삭제
            const myCards = await tx.activityCard.findMany({
                where: { service_id: svcId },
                select: { id: true },
            })
            const myCardIds = myCards.map((c) => c.id)
            if (myCardIds.length > 0) {
                await tx.keyword.deleteMany({ where: { card_id: { in: myCardIds } } })
                await tx.activityCard.deleteMany({ where: { id: { in: myCardIds } } })
            }

            // 7) 내가 속한 채팅방들 수집
            const myChats = await tx.chat.findMany({
                where: { service_id: svcId },
                select: { chat_id: true },
                distinct: ['chat_id'],
            })
            const myRoomIds = myChats.map((c) => c.chat_id)

            if (myRoomIds.length > 0) {
                // 7-1) 방의 메시지 삭제
                await tx.message.deleteMany({ where: { chat_id: { in: myRoomIds } } })
                // 7-2) 방의 커피챗 삭제
                await tx.coffeeChat.deleteMany({ where: { chat_id: { in: myRoomIds } } })
                // 7-3) 방의 모든 참여자 row 삭제(상대방 것도 함께 삭제 → 방 비워짐)
                await tx.chat.deleteMany({ where: { chat_id: { in: myRoomIds } } })
                // 7-4) 빈 채팅방 자체 삭제
                await tx.chattingRoom.deleteMany({ where: { id: { in: myRoomIds } } })
            }

            // 8) 유저 활동지역
            await tx.userArea.deleteMany({ where: { service_id: svcId } })

            // 9) 차단/관심/네트워크/알림/구독
            await tx.userBlock.deleteMany({
                where: { OR: [{ blocker_id: svcId }, { blocked_id: svcId }] },
            })
            await tx.interest.deleteMany({
                where: { OR: [{ sender_id: svcId }, { recipient_id: svcId }] },
            })
            await tx.network.deleteMany({
                where: { OR: [{ sender_id: svcId }, { recipient_id: svcId }] },
            })
            await tx.notification.deleteMany({
                where: { OR: [{ sender_id: svcId }, { receiver_id: svcId }] },
            })
            await tx.subscribedNotice.deleteMany({ where: { service_id: svcId } })

            // 10) 내가 올린 공고 + 공고지역
            const myNotices = await tx.recruitingNotice.findMany({
                where: { service_id: svcId },
                select: { id: true },
            })
            const myNoticeIds = myNotices.map((n) => n.id)
            if (myNoticeIds.length > 0) {
                await tx.recruitingArea.deleteMany({
                    where: { recruiting_id: { in: myNoticeIds } },
                })
                await tx.recruitingNotice.deleteMany({
                    where: { id: { in: myNoticeIds } },
                })
            }

            // 11) 내 피드 삭제
            if (myFeedIds.length > 0) {
                await tx.feed.deleteMany({ where: { id: { in: myFeedIds } } })
            }

            // 12) UserDB 연결 삭제
            await tx.userDB.deleteMany({ where: { service_id: svcId } })

            // 13) Service 삭제
            await tx.service.delete({ where: { id: svcId } })

            // 14) 같은 User가 다른 Service를 더 갖고 있는지 확인
            const rest = await tx.userDB.count({ where: { user_id: myUserId } })
            if (rest === 0) {
                await tx.user.delete({ where: { id: myUserId } })
            }

            return {
                deleted_service_id: svcId.toString(),
                user_deleted: rest === 0,
            }
        })
    },
}

export default usersService
