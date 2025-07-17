import app from './app.js'
import { config } from './config/config.js'
import redisClient from './libs/redisClient.js'

// Redis 연결
await redisClient.connect()

app.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`)
})
