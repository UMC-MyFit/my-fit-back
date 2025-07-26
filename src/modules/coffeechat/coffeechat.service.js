import { PrismaClient } from '@prisma/client'
import { BadRequestError } from '../../middlewares/error.js'
import { convertBigIntsToNumbers } from '../../libs/dataTransformer.js'
const prisma = new PrismaClient()
const coffeechatService = {
    getCoffeeChatPreview: async (chattingRoomId) => {
        // 1. 채팅방의 참여자 2명 가져오기
        const chats = await prisma.chat.findMany({
            where: { chat_id: chattingRoomId },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        profile_img: true,
                    }
                }
            }
        })

        if (chats.length !== 2) {
            throw new BadRequestError('존재하지 않는 채팅방입니다.')
        }

        // 2. 참여자 정보 분리
        const [serviceA, serviceB] = chats.map((chat) => chat.service)

        return convertBigIntsToNumbers({
            participants: [
                {
                    service_id: serviceA.id,
                    name: serviceA.name,
                    profile_img: serviceA.profile_img,
                },
                {
                    service_id: serviceB.id,
                    name: serviceB.name,
                    profile_img: serviceB.profile_img
                }
            ]
        })
    }
}

export default coffeechatService