import {
    sendMessage,
    getMessages,
    markMessagesAsRead,
} from "../services/message.service.js";

const createMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId || req.body.conversationId;
        const content = req.body.content || req.body.text;
        const { receiverId, messageType, attachmentUrl } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({
                success: false,
                message: "conversationId and content/text are required",
            });
        }

        const message = await sendMessage({
            conversationId,
            senderId: req.user.id,
            receiverId,
            content,
            text: content,
            messageType,
            attachmentUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Message sent",
            data: message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getChatMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 100, 200);

        const result = await getMessages(
            conversationId,
            req.user.id,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            messages: result.messages,
            data: result.messages,
            pagination: result.pagination,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const readMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        await markMessagesAsRead(conversationId, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Messages marked as read",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    createMessage,
    getChatMessages,
    readMessages,
};
