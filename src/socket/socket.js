import fs from 'fs'
import http from 'http'
import https from 'https'
import { Server } from "socket.io";
import app from "../app.js";

const USE_HTTPS = String(process.env.USE_HTTPS).toLowerCase() === 'true'
const keyPath = process.env.SSL_KEY_PATH
const certPath = process.env.SSL_CERT_PATH

let httpServer

if (USE_HTTPS && keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
    }
    httpServer = https.createServer(credentials, app)
    console.log('HTTPS server 실행')
} else {
    httpServer = http.createServer(app)
    if (USE_HTTPS) {
        console.log('인증서가 존재하지 않아 HTTP로 구동')
    }
    else {
        console.log('HTTP server 실행')
    }
}


const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://myfit-official.netlify.app"],
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ['websocket', 'polling']
});

io.on("connection", (socket) => {

    socket.on("joinRoom", (roomId) => {
        const roomName = `chat:${roomId}`;
        socket.join(roomName);
    });

    socket.on("sendMessage", (data) => {

        const roomName = `chat:${data.roomId}`;
        io.to(roomName).emit("receiveMessage", data);

    });
});

export { httpServer, io };
