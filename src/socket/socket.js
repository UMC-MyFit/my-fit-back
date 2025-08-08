import { createServer } from "http";
import { Server } from "socket.io";
import app from "../app.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`✅ 소켓 연결됨: ${socket.id}`);
    console.log("👉 현재 접속 중인 socket 수:", io.engine.clientsCount);

    socket.on("joinRoom", (roomId) => {
        const roomName = `chat:${roomId}`;
        socket.join(roomName);
        console.log(`🚪 ${socket.id} → ${roomName} 참가`);
        console.log("📦 현재 socket.rooms:", Array.from(socket.rooms));
    });

    socket.on("sendMessage", (data) => {

        const roomName = `chat:${data.roomId}`;
        io.to(roomName).emit("receiveMessage", data);

    });

    socket.on("disconnect", () => {
        console.log(`❌ 소켓 연결 해제됨: ${socket.id}`);
    });
});

httpServer.listen(3000, "0.0.0.0", () => {
    console.log("🚀 소켓 서버 실행 중: http://0.0.0.0:3000");
});

export { httpServer, io };
