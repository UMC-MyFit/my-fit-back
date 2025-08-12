import { httpServer } from './socket/socket.js'
import { config } from './config/config.js'

const isHttps = String(process.env.USE_HTTPS).toLocaleLowerCase() === 'true'
httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server running at ${isHttps ? 'https' : 'http'}://localhost:${config.port}`)
})
