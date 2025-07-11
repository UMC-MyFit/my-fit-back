import express, { response } from 'express'
import session from 'express-session'
import passport from 'passport'
import '../src/config/passport.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './docs/swagger.js'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes/index.js'
import { responseHandler } from './middlewares/responseHandler.js'
import { errorHandler } from './middlewares/errorHandler.js'
const app = express()

// 작업 시 미들웨어 등록 순서 임의 변경 금지🎇

// swagger 설정
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 공통 미들웨어
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 세션 및 Passport 초기화
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)
app.use(passport.initialize())
app.use(passport.session()) // 세션 연결

// 응답 헬퍼 등록
app.use(responseHandler)

// API 라우팅
app.use('/api', router)

// 에러 핸들링 미들웨어
app.use(errorHandler)

export default app
