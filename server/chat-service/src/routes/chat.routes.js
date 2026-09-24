import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    createChat,
    getChats,
    getChat,
} from "../controllers/chat.controller.js";

import {
    createMessage,
    getChatMessages,
    readMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

// Create / get existing conversation
router.post("/", authMiddleware, createChat);

// Get all conversations of logged-in user
router.get("/", authMiddleware, getChats);

// Get single conversation
router.get("/:conversationId", authMiddleware, getChat);

// Conversation messages
router.get("/:conversationId/messages", authMiddleware, getChatMessages);
router.post("/:conversationId/messages", authMiddleware, createMessage);
router.patch("/:conversationId/read", authMiddleware, readMessages);

export default router;