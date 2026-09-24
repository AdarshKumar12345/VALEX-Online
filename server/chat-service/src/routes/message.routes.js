import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    createMessage,
    getChatMessages,
    readMessages
} from "../controllers/message.controller.js";

const router = express.Router();

// Send a message
router.post(
    "/",
    authMiddleware,
    createMessage
);

// Get messages
router.get(
    "/:conversationId",
    authMiddleware,
    getChatMessages
);

// Mark messages as read
router.patch(
    "/:conversationId/read",
    authMiddleware,
    readMessages
);

export default router;