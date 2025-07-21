import { httpServer } from './socket/socket.js'
import { config } from './config/config.js'

httpServer.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`)
})
