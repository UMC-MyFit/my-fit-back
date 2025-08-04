import express from 'express'
import RelationshipsController from './relationships.controller.js'
import { isAuthenticated } from '../../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/relationships/{recipient_id}/interests:
 *   post:
 *     summary: 관심 추가
 *     description: "로그인된 사용자가 다른 서비스에 관심을 표현합니다."
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: path
 *         name: recipient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 관심을 표시할 상대방의 서비스 고유 ID
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: 관심 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "관심이 성공적으로 추가되었습니다."
 *       400:
 *         description: "잘못된 요청"
 *       409:
 *         description: "이미 관심을 표시한 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "이미 관심을 표시한 사용자입니다."
 *   delete:
 *     summary: 관심 해제
 *     description: "로그인된 사용자가 다른 서비스에 대한 관심을 해제합니다."
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: path
 *         name: recipient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 관심을 해제할 상대방의 서비스 고유 ID
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 관심 해제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "관심이 성공적으로 해제되었습니다."
 *       404:
 *         description: "관심을 표시하지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "관심을 표시하지 않은 사용자입니다."
 */
router.post('/:recipient_id/interests', isAuthenticated, RelationshipsController.addInterest)
router.delete('/:recipient_id/interests', isAuthenticated, RelationshipsController.removeInterest)

/**
 * @swagger
 * /api/relationships/interests:
 *   get:
 *     summary: 내가 관심 등록한 유저 목록 조회
 *     description: "로그인한 사용자가 관심을 표시한 서비스들의 목록을 페이지네이션으로 조회합니다."
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 페이지당 항목 수
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 관심 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "관심 목록 조회가 성공적으로 완료되었습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: int64
 *                             description: 관심 관계 ID
 *                           sender_id:
 *                             type: string
 *                             format: int64
 *                             description: 관심을 표시한 사용자 ID
 *                           recipient_id:
 *                             type: string
 *                             format: int64
 *                             description: 관심을 받은 사용자 ID
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: 관심 등록 시간
 *                           recipient:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: int64
 *                               service_name:
 *                                 type: string
 *                               network_status:
 *                                 type: string
 *                               profile_image:
 *                                 type: string
 *                               low_sector:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalCount:
 *                           type: integer
 *                           example: 42
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: "잘못된 요청 (페이지네이션 파라미터 오류)"
 *       401:
 *         description: "인증되지 않은 사용자"
 *       500:
 *         description: "서버 내부 오류"
 */
router.get('/interests', isAuthenticated, RelationshipsController.getMyInterests)

/**
 * @swagger
 * /api/relationships/interests/received:
 *   get:
 *     summary: 나를 관심 등록한 사람들 목록 조회
 *     description: 로그인된 사용자에게 관심을 보낸(나를 관심 등록한) 다른 서비스들의 목록을 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 나를 관심 등록한 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "나를 관심 등록한 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1" # Interest ID
 *                       sender_service_id:
 *                         type: string
 *                         example: "3"
 *                       sender_service_name:
 *                         type: string
 *                         example: "보낸서비스이름"
 *                       sender_service_profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: "http://example.com/sender_profile.png"
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/interests/received', isAuthenticated, RelationshipsController.getReceivedInterests)

/**
 * @swagger
 * /api/relationships/interests/status/{recipient_id}:
 *   get:
 *     summary: 로그인한 유저의 특정 유저 관심 등록 상태 조회
 *     description: 로그인된 사용자가 특정 다른 서비스를 관심 등록했는지 여부를 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: recipient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 조회 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 관심 등록 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "관심 등록 상태를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     is_interested:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/interests/status/:recipient_id', isAuthenticated, RelationshipsController.checkInterestStatus)

/**
 * @swagger
 * /api/relationships/interests/sent/count/{sender_id}:
 *   get:
 *     summary: 특정 유저가 관심 등록한 사람들의 수 조회
 *     description: 특정 서비스가 다른 서비스에게 보낸 관심(Interest)의 총 개수를 조회합니다.
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: path
 *         name: sender_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 관심 수를 조회할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 보낸 관심 수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "특정 유저가 보낸 관심 수를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 5
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/interests/sent/count/:sender_id', RelationshipsController.getSentInterestsCount)

/**
 * @swagger
 * /api/relationships/interests/received/count/{recipient_id}:
 *   get:
 *     summary: 특정 유저를 관심 등록한 사람들의 수 조회
 *     description: 특정 서비스를 관심 등록한 다른 서비스들의 총 개수를 조회합니다.
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: path
 *         name: recipient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 관심을 받은 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 받은 관심 수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "특정 유저를 관심 등록한 사람들의 수를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 10
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/interests/received/count/:recipient_id', RelationshipsController.getReceivedInterestsCount)

/**
 * @swagger
 * /api/relationships/networks/request/{recipient_id}:
 *   post:
 *     summary: 네트워크 요청 보내기
 *     description: 현재 로그인된 사용자가 특정 서비스에게 네트워크 연결을 요청합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 네트워크 요청을 보낼 상대방 서비스 ID
 *     responses:
 *       200:
 *         description: 네트워크 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 요청이 성공적으로 전송되었습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError' # 자기 자신에게 요청, 이미 차단 관계
 *       404:
 *         $ref: '#/components/schemas/NotFoundError' # 대상 서비스 없음
 *       409: # Conflict - 이미 요청했거나 이미 연결됨
 *         description: 이미 요청했거나 연결된 상태
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "이미 네트워크 요청을 보냈거나 연결된 상태입니다."
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.post('/networks/request/:recipient_id', isAuthenticated, RelationshipsController.sendNetworkRequest)

/**
 * @swagger
 * /api/relationships/networks/request/{network_id}/accept:
 *   patch:
 *     summary: 네트워크 요청 수락
 *     description: 현재 로그인된 사용자가 특정 네트워크 요청을 '수락'합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: network_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 수락할 네트워크 요청의 ID
 *     responses:
 *       200:
 *         description: 요청 수락 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 요청이 성공적으로 수락되었습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError' # 권한 없음 (내 요청이 아님)
 *       404:
 *         $ref: '#/components/schemas/NotFoundError' # 요청 없음
 *       409: # Conflict - 이미 수락 또는 거절됨
 *         description: 이미 처리된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "이미 처리된 네트워크 요청입니다."
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/networks/request/:network_id/accept', isAuthenticated, RelationshipsController.acceptNetworkRequest)

/**
 * @swagger
 * /api/relationships/networks/request/{network_id}/reject:
 *   patch:
 *     summary: 네트워크 요청 거절
 *     description: 현재 로그인된 사용자가 특정 네트워크 요청을 '거절'합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: network_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 거절할 네트워크 요청의 ID
 *     responses:
 *       200:
 *         description: 요청 거절 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 요청이 성공적으로 거절되었습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError' # 권한 없음 (내 요청이 아님)
 *       404:
 *         $ref: '#/components/schemas/NotFoundError' # 요청 없음
 *       409: # Conflict - 이미 수락 또는 거절됨
 *         description: 이미 처리된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "이미 처리된 네트워크 요청입니다."
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.patch('/networks/request/:network_id/reject', isAuthenticated, RelationshipsController.rejectNetworkRequest)

/**
 * @swagger
 * /api/relationships/networks/disconnect/{network_id}:
 *   delete:
 *     summary: 네트워크 연결 끊기
 *     description: 현재 로그인된 사용자가 '수락됨' 상태의 특정 네트워크 연결을 끊습니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: network_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 끊을 네트워크 연결의 ID (Network 테이블의 id)
 *     responses:
 *       200:
 *         description: 네트워크 연결 끊기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 연결이 성공적으로 끊어졌습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError' # 권한 없음 (내 연결이 아님)
 *       404:
 *         $ref: '#/components/schemas/NotFoundError' # 연결 없음
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.delete('/networks/disconnect/:network_id', isAuthenticated, RelationshipsController.disconnectNetwork)

/**
 * @swagger
 * /api/relationships/networks/connections:
 *   get:
 *     summary: 나의 연결된 네트워크 목록 조회
 *     description: 현재 로그인된 사용자의 '수락됨' 상태의 양방향 네트워크 연결 목록을 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공적으로 연결 목록 조회
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "연결된 네트워크 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1" # Network ID
 *                       other_service_id:
 *                         type: string
 *                         example: "2" # 상대방 Service ID
 *                       other_service_name:
 *                         type: string
 *                         example: "상대방서비스"
 *                       other_service_profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: "http://example.com/profile2.png"
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/networks/connections', isAuthenticated, RelationshipsController.getNetworkConnections)

/**
 * @swagger
 * /api/relationships/networks/sent:
 *   get:
 *     summary: 내가 보낸 네트워크 요청 목록 조회
 *     description: 현재 로그인된 사용자가 다른 서비스에게 보낸 '대기 중' 상태의 네트워크 요청 목록을 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공적으로 보낸 요청 목록 조회
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "보낸 네트워크 요청 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "3" # Network ID
 *                       recipient_service_id:
 *                         type: string
 *                         example: "4"
 *                       recipient_service_name:
 *                         type: string
 *                         example: "받는서비스"
 *                       recipient_service_profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: "http://example.com/profile4.png"
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/networks/sent', isAuthenticated, RelationshipsController.getSentNetworkRequests)

/**
 * @swagger
 * /api/relationships/networks/received:
 *   get:
 *     summary: 받은 네트워크 요청 목록 조회 (대기 중)
 *     description: 로그인된 사용자에게 다른 서비스들이 보낸 대기 중인 네트워크 요청 목록을 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 받은 네트워크 요청 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "받은 네트워크 요청 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1" # Network Request ID
 *                       sender_service_id:
 *                         type: string
 *                         example: "101"
 *                       sender_service_name:
 *                         type: string
 *                         example: "요청보낸서비스이름"
 *                       sender_service_profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: "http://example.com/sender_profile.png"
 *                       status:
 *                         type: string
 *                         example: "PENDING"
 *                       requested_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-27T10:00:00Z"
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/networks/received', isAuthenticated, RelationshipsController.getReceivedNetworkRequests)

/**
 * @swagger
 * /api/relationships/networks/status/{target_service_id}:
 *   get:
 *     summary: 특정 사용자와의 네트워크 상태 확인
 *     description: 로그인된 사용자와 특정 다른 서비스 간의 네트워크 관계 상태를 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: target_service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 상태를 조회할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 네트워크 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 상태를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [SELF, CONNECTED, PENDING_SENT, PENDING_RECEIVED, REJECTED, NO_RELATION, UNKNOWN]
 *                       example: "CONNECTED"
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/networks/status/:target_service_id', isAuthenticated, RelationshipsController.getNetworkStatus)

/**
 * @swagger
 * /api/relationships/networks/count/{target_service_id}:
 *   get:
 *     summary: 특정 사용자의 네트워크 연결 수 조회
 *     description: 특정 서비스의 현재 활성화된(ACCEPTED 상태) 네트워크 연결의 총 개수를 조회합니다.
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: path
 *         name: target_service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 네트워크 연결 수를 조회할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 네트워크 연결 수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "네트워크 연결 수를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 15
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/networks/count/:target_service_id', RelationshipsController.getNetworkConnectionsCount)

/**
 * @swagger
 * /api/relationships/blocks/{blocked_id}:
 *   post:
 *     summary: 사용자 차단
 *     description: 로그인된 사용자가 다른 특정 사용자를 차단합니다. 차단 시 기존의 관심 및 네트워크 관계도 정리됩니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blocked_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 차단할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 사용자 차단 성공 및 관계 정리 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "사용자 차단 및 관련 관계 정리가 성공적으로 완료되었습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: 이미 차단된 사용자
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *             examples:
 *               message:
 *                 value: "이미 차단된 사용자입니다."
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.post('/blocks/:blocked_id', isAuthenticated, RelationshipsController.blockUser)

/**
 * @swagger
 * /api/relationships/blocks/{blocked_id}:
 *   delete:
 *     summary: 사용자 차단 해제
 *     description: 로그인된 사용자가 이전에 차단했던 특정 사용자의 차단을 해제합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blocked_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 차단 해제할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 사용자 차단 해제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "사용자 차단이 성공적으로 해제되었습니다."
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: 해당 사용자가 차단되어 있지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             examples:
 *               message:
 *                 value: "해당 사용자는 차단되어 있지 않습니다."
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.delete('/blocks/:blocked_id', isAuthenticated, RelationshipsController.unblockUser)

/**
 * @swagger
 * /api/relationships/blocked_users:
 *   get:
 *     summary: 차단한 사용자 목록 조회
 *     description: 로그인된 사용자가 차단한 다른 사용자들의 목록을 조회합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 차단한 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "차단한 사용자 목록을 성공적으로 조회했습니다."
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1" # Block record ID
 *                       blocked_service_id:
 *                         type: string
 *                         example: "10"
 *                       blocked_service_name:
 *                         type: string
 *                         example: "차단된서비스이름"
 *                       blocked_service_profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: "http://example.com/blocked_profile.png"
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/blocked_users', isAuthenticated, RelationshipsController.getBlockedUsers)

/**
 * @swagger
 * /api/relationships/block_status/{target_service_id}:
 *   get:
 *     summary: 특정 사용자 차단 여부 확인
 *     description: 로그인된 사용자가 특정 다른 사용자를 차단했는지, 또는 그 사용자가 로그인된 사용자를 차단했는지 여부를 확인합니다.
 *     tags:
 *       - Relationships
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: target_service_id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *         description: 차단 여부를 확인할 대상 서비스의 ID
 *     responses:
 *       200:
 *         description: 차단 상태 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "차단 상태를 성공적으로 조회했습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     is_blocked_by_me:
 *                       type: boolean
 *                       example: true
 *                       description: "로그인된 사용자가 대상 사용자를 차단했는지 여부"
 *                     is_blocked_by_them:
 *                       type: boolean
 *                       example: false
 *                       description: "대상 사용자가 로그인된 사용자를 차단했는지 여부"
 *       400:
 *         $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         $ref: '#/components/schemas/InternalServerError'
 */
router.get('/block_status/:target_service_id', isAuthenticated, RelationshipsController.checkBlockStatus)

export default router