import jwt from "jsonwebtoken";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const setupChatSocket = (io) => {
    // Authenticate socket connection
    io.use((socket, next) => {
        try {
            const cookieToken = socket.handshake.headers?.cookie
                ?.split(";")
                .map((c) => c.trim())
                .find((c) => c.startsWith("token="))
                ?.split("=")[1];

            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1] ||
                cookieToken;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = {
                id: decoded.id || decoded.userId,
                ...decoded
            };

            next();
        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.user.id}`);

        // Join user's personal room
        socket.join(`user:${socket.user.id}`);

        // Join conversation
        socket.on("join_conversation", async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user.id
                });

                if (!conversation) {
                    return socket.emit("error", {
                        message: "Conversation not found"
                    });
                }

                socket.join(`conversation:${conversationId}`);

                socket.emit("joined_conversation", {
                    conversationId
                });
            } catch (error) {
                socket.emit("error", {
                    message: error.message
                });
            }
        });

        // Send real-time message
        socket.on("send_message", async (data) => {
            try {
                const {
                    conversationId,
                    receiverId,
                    content,
                    messageType = "text",
                    attachmentUrl = null
                } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user.id
                });

                if (!conversation) {
                    return socket.emit("error", {
                        message: "Conversation not found"
                    });
                }

                const message = await Message.create({
                    conversationId,
                    senderId: socket.user.id,
                    receiverId,
                    content,
                    messageType,
                    attachmentUrl
                });

                await Conversation.findByIdAndUpdate(
                    conversationId,
                    {
                        lastMessage: content,
                        lastMessageAt: new Date()
                    }
                );

                const messageData = message.toObject();

                // Send to everyone in conversation
                io.to(`conversation:${conversationId}`).emit(
                    "new_message",
                    messageData
                );

                // Also notify receiver if not inside conversation
                io.to(`user:${receiverId}`).emit(
                    "message_notification",
                    messageData
                );
            } catch (error) {
                socket.emit("error", {
                    message: error.message
                });
            }
        });

        // Typing indicator
        socket.on("typing", ({ conversationId, receiverId }) => {
            io.to(`user:${receiverId}`).emit("user_typing", {
                conversationId,
                userId: socket.user.id
            });
        });

        // Stop typing
        socket.on("stop_typing", ({ conversationId, receiverId }) => {
            io.to(`user:${receiverId}`).emit("user_stopped_typing", {
                conversationId,
                userId: socket.user.id
            });
        });

        // Read messages
        socket.on("messages_read", async ({ conversationId }) => {
            await Message.updateMany(
                {
                    conversationId,
                    receiverId: socket.user.id,
                    status: { $ne: "read" }
                },
                {
                    $set: {
                        status: "read",
                        readAt: new Date()
                    }
                }
            );

            io.to(`conversation:${conversationId}`).emit(
                "messages_read",
                {
                    conversationId,
                    userId: socket.user.id
                }
            );
        });

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.user.id}`);
        });
    });
};

export default setupChatSocket;