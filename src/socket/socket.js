import { createServer } from 'http'
import { Server } from 'socket.io'
import app from '../app.js'

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    }
})

io.on('connection', (socket) => {
    console.log(`소켓 연결: ${socket.id}`)

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId)
        console.log(`참여한 채팅방: ${roomId}`)
    })

    socket.on('sendMessage', (data) => {
        io.to(data.roomId).emit('receiveMessage', data)
    })

    socket.on('disconnect', () => {
        console.log(`소켓 연결 해제: ${socket.id}`)
    })
})

export { httpServer, io }