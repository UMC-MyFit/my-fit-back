import { createServer } from "http";
import { Server } from "socket.io";
import app from "../app.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://myfit-official.netlify.app"],
        methods: ["GET", "POST"],
        credentials: true,
    },
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
