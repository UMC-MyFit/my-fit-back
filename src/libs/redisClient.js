import { createClient } from 'redis'

const redisClient = createClient()

redisClient.on('error', (error) => {
    console.error('Redis Client Error', error)
})

export default redisClient
