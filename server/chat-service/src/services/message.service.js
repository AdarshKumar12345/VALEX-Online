import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const sendMessage = async ({
    conversationId,
    senderId,
    receiverId,
    content,
    text,
    messageType = "text",
    attachmentUrl = null,
}) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId,
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const messageContent = content || text || "";
    if (!messageContent.trim()) {
        throw new Error("Message content cannot be empty");
    }

    const actualReceiverId =
        receiverId || conversation.participants.find((p) => p !== senderId) || "";

    const message = await Message.create({
        conversationId,
        senderId,
        receiverId: actualReceiverId,
        content: messageContent.trim(),
        messageType,
        attachmentUrl,
        status: "sent",
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: messageContent.trim(),
        lastMessageAt: new Date(),
    });

    const doc = message.toObject ? message.toObject() : message;
    return {
        id: doc._id ? doc._id.toString() : doc.id,
        _id: doc._id,
        conversationId: doc.conversationId,
        senderId: doc.senderId,
        receiverId: doc.receiverId,
        text: doc.content || doc.text,
        content: doc.content || doc.text,
        messageType: doc.messageType,
        attachmentUrl: doc.attachmentUrl,
        status: doc.status,
        createdAt: doc.createdAt,
    };
};

const getMessages = async (
    conversationId,
    userId,
    page = 1,
    limit = 100
) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const total = await Message.countDocuments({
        conversationId,
    });

    const messages = await Message.find({
        conversationId,
    })
        .sort({ createdAt: 1 })
        .limit(limit);

    const formatted = messages.map((m) => {
        const doc = m.toObject ? m.toObject() : m;
        return {
            id: doc._id ? doc._id.toString() : doc.id,
            _id: doc._id,
            conversationId: doc.conversationId,
            senderId: doc.senderId,
            receiverId: doc.receiverId,
            text: doc.content || doc.text,
            content: doc.content || doc.text,
            messageType: doc.messageType,
            attachmentUrl: doc.attachmentUrl,
            status: doc.status,
            createdAt: doc.createdAt,
        };
    });

    return {
        messages: formatted,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

const markMessagesAsRead = async (conversationId, userId) => {
    return Message.updateMany(
        {
            conversationId,
            receiverId: userId,
            status: { $ne: "read" },
        },
        {
            $set: {
                status: "read",
                readAt: new Date(),
            },
        }
    );
};

export {
    sendMessage,
    getMessages,
    markMessagesAsRead,
};