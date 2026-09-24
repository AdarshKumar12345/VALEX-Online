import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import setupChatSocket from "./sockets/chat.socket.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5004;

// --------------------
// Database
// --------------------

await connectDB();

// --------------------
// Middleware
// --------------------

app.use(helmet());

app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});

app.use(limiter);

// --------------------
// Health Check
// --------------------

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "chat-service",
        status: "running",
    });
});

// --------------------
// Routes
// --------------------

app.use("/api/chats", chatRoutes);
app.use("/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/messages", messageRoutes);
app.use("/", chatRoutes);

// --------------------
// Socket.IO
// --------------------

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true,
    },
});

setupChatSocket(io);

// --------------------
// Start Server
// --------------------

server.listen(PORT, () => {
    console.log(`🚀 Chat Service running on port ${PORT}`);
    console.log(`🔌 Socket.IO running on port ${PORT}`);
});