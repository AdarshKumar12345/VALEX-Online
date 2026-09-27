import jwt from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const setupChatSocket = async (io) => {
    /*
    |--------------------------------------------------------------------------
    | Redis Adapter
    |--------------------------------------------------------------------------
    */

    const redisUrl =
        process.env.REDIS_URL || "redis://localhost:6379";

    const pubClient = createClient({
        url: redisUrl,
    });

    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
        console.error("Redis Pub Client Error:", err);
    });

    subClient.on("error", (err) => {
        console.error("Redis Sub Client Error:", err);
    });

    await Promise.all([
        pubClient.connect(),
        subClient.connect(),
    ]);

    io.adapter(createAdapter(pubClient, subClient));

    console.log("🔴 Socket.IO Redis Adapter connected");

    /*
    |--------------------------------------------------------------------------
    | Socket Authentication
    |--------------------------------------------------------------------------
    */

    const parseCookies = (cookieHeader) => {
        if (!cookieHeader) return {};
        const cookies = {};
        const parts = cookieHeader.split(";");
        for (const part of parts) {
            const [key, ...val] = part.trim().split("=");
            if (key) {
                cookies[key] = decodeURIComponent(val.join("="));
            }
        }
        return cookies;
    };

    io.use((socket, next) => {
        try {
            const cookies = parseCookies(socket.handshake.headers?.cookie);
            const accessToken =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1] ||
                cookies.token ||
                cookies.access_token;

            const refreshToken =
                socket.handshake.auth?.refreshToken ||
                cookies.refreshToken;

            const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key";
            const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;

            // 1. Try verifying access token
            if (accessToken) {
                try {
                    const decoded = jwt.verify(accessToken, jwtSecret);
                    socket.user = {
                        id: decoded.userId || decoded.id,
                        ...decoded,
                    };
                    return next();
                } catch (err) {
                    if (err.name !== "TokenExpiredError" && !refreshToken) {
                        return next(new Error("Invalid token"));
                    }
                }
            }

            // 2. Fallback to verifying refresh token if access token is missing or expired
            if (refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(refreshToken, jwtRefreshSecret);
                    socket.user = {
                        id: decodedRefresh.userId || decodedRefresh.id,
                        ...decodedRefresh,
                    };
                    return next();
                } catch (err) {
                    if (err.name === "TokenExpiredError") {
                        console.warn(`[Socket.IO] Connection rejected: refresh token expired for socket ${socket.id}`);
                        return next(new Error("Token expired"));
                    }
                }
            }

            if (!accessToken && !refreshToken) {
                return next(new Error("Authentication required"));
            }

            return next(new Error("Invalid or expired token"));
        } catch (error) {
            console.error(`[Socket.IO] Authentication error for socket ${socket.id}:`, error.message);
            next(new Error("Authentication failed"));
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Connection
    |--------------------------------------------------------------------------
    */

    io.on("connection", (socket) => {
        console.log(
            `🔌 User connected: ${socket.user.id}`
        );

        /*
        |--------------------------------------------------------------------------
        | Personal User Room
        |--------------------------------------------------------------------------
        */

        socket.join(`user:${socket.user.id}`);

        /*
        |--------------------------------------------------------------------------
        | Join Conversation
        |--------------------------------------------------------------------------
        */

        socket.on(
            "join_conversation",
            async (conversationId) => {
                try {
                    const conversation =
                        await Conversation.findOne({
                            _id: conversationId,
                            participants: socket.user.id,
                        });

                    if (!conversation) {
                        return socket.emit("error", {
                            message:
                                "Conversation not found",
                        });
                    }

                    socket.join(
                        `conversation:${conversationId}`
                    );

                    socket.emit(
                        "joined_conversation",
                        {
                            conversationId,
                        }
                    );

                    console.log(
                        `👤 ${socket.user.id} joined conversation ${conversationId}`
                    );
                } catch (error) {
                    console.error(
                        "Join conversation error:",
                        error
                    );

                    socket.emit("error", {
                        message: error.message,
                    });
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Leave Conversation
        |--------------------------------------------------------------------------
        */

        socket.on(
            "leave_conversation",
            (conversationId) => {
                socket.leave(
                    `conversation:${conversationId}`
                );

                console.log(
                    `👋 ${socket.user.id} left conversation ${conversationId}`
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Send Message
        |--------------------------------------------------------------------------
        */

        socket.on(
            "send_message",
            async (data) => {
                try {
                    const {
                        conversationId,
                        receiverId,
                        content,
                        messageType = "text",
                        attachmentUrl = null,
                    } = data;

                    /*
                    | Validate conversation
                    */

                    const conversation =
                        await Conversation.findOne({
                            _id: conversationId,
                            participants:
                                socket.user.id,
                        });

                    if (!conversation) {
                        return socket.emit(
                            "error",
                            {
                                message:
                                    "Conversation not found",
                            }
                        );
                    }

                    /*
                    | Validate content
                    */

                    if (
                        !content?.trim() &&
                        !attachmentUrl
                    ) {
                        return socket.emit(
                            "error",
                            {
                                message:
                                    "Message cannot be empty",
                            }
                        );
                    }

                    /*
                    | Save message
                    */

                    const message =
                        await Message.create({
                            conversationId,
                            senderId:
                                socket.user.id,
                            receiverId,
                            content,
                            messageType,
                            attachmentUrl,
                        });

                    /*
                    | Update conversation
                    */

                    await Conversation.findByIdAndUpdate(
                        conversationId,
                        {
                            lastMessage:
                                content ||
                                "Attachment",
                            lastMessageAt:
                                new Date(),
                        }
                    );

                    const messageData =
                        message.toObject();

                    /*
                    |--------------------------------------------------------------------------
                    | Broadcast to conversation
                    |--------------------------------------------------------------------------
                    |
                    | Redis Adapter automatically sends this
                    | event to sockets connected to other
                    | Chat Service instances.
                    |
                    */

                    io.to(
                        `conversation:${conversationId}`
                    ).emit(
                        "new_message",
                        messageData
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Receiver Notification
                    |--------------------------------------------------------------------------
                    |
                    | Send notification to receiver's
                    | personal room.
                    |
                    */

                    io.to(`user:${receiverId}`).emit(
                        "message_notification",
                        messageData
                    );
                } catch (error) {
                    console.error(
                        "Send message error:",
                        error
                    );

                    socket.emit("error", {
                        message: error.message,
                    });
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Typing
        |--------------------------------------------------------------------------
        */

        socket.on(
            "typing",
            ({ conversationId, receiverId }) => {
                /*
                | Redis Adapter automatically routes
                | this event across Chat Service instances.
                */

                io.to(`user:${receiverId}`).emit(
                    "user_typing",
                    {
                        conversationId,
                        userId: socket.user.id,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Stop Typing
        |--------------------------------------------------------------------------
        */

        socket.on(
            "stop_typing",
            ({ conversationId, receiverId }) => {
                io.to(`user:${receiverId}`).emit(
                    "user_stopped_typing",
                    {
                        conversationId,
                        userId: socket.user.id,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Read Messages
        |--------------------------------------------------------------------------
        */

        socket.on(
            "messages_read",
            async ({ conversationId }) => {
                try {
                    await Message.updateMany(
                        {
                            conversationId,
                            receiverId:
                                socket.user.id,
                            status: {
                                $ne: "read",
                            },
                        },
                        {
                            $set: {
                                status: "read",
                                readAt: new Date(),
                            },
                        }
                    );

                    /*
                    | Redis Adapter makes this work
                    | across all Chat Service instances.
                    */

                    io.to(
                        `conversation:${conversationId}`
                    ).emit(
                        "messages_read",
                        {
                            conversationId,
                            userId:
                                socket.user.id,
                        }
                    );
                } catch (error) {
                    console.error(
                        "Messages read error:",
                        error
                    );

                    socket.emit("error", {
                        message: error.message,
                    });
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Disconnect
        |--------------------------------------------------------------------------
        */

        socket.on("disconnect", (reason) => {
            console.log(
                `❌ User disconnected: ${socket.user.id} (${reason})`
            );
        });
    });
};

export default setupChatSocket;