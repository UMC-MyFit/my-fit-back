import express, { response } from 'express'
import session from 'express-session'
import passport from 'passport'
import './config/passport.js'
import '../src/config/passport.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './docs/swagger.js'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes/index.js'
import { responseHandler } from './middlewares/responseHandler.js'
import { errorHandler } from './middlewares/errorHandler.js'
import path from 'path'
import { fileURLToPath } from 'url';
const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// swagger 설정
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 공통 미들웨어
app.use(cors({
    origin: ['http://localhost:5173', 'https://myfit-official.netlify.app'],
    credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())

// 세션 및 Passport 초기화
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        }
    })
)

app.use(passport.initialize())
app.use(passport.session()) // 세션 연결
app.use('/.well-known', express.static(path.join(__dirname, '..', '.well-known')))
// 응답 헬퍼 등록
app.use(responseHandler)

// API 라우팅
app.use('/api', router)

// 에러 핸들링 미들웨어
app.use(errorHandler)

export default app
