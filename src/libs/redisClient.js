import { createClient } from 'redis'

const redisClient = createClient({
    username: process.env.REDIS_USER_NAME,
    password: process.env.REDIS_SECRET,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', (error) => {
    console.error('Redis Client Error', error)
})

export default redisClient
