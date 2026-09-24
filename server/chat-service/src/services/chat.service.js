import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const createConversation = async (userId, participantId, listingId, metadata = {}) => {
    if (!participantId && !listingId) {
        throw new Error("participantId or listingId is required");
    }

    if (participantId && userId === participantId) {
        throw new Error("You cannot start a conversation with yourself");
    }

    const query = {
        participants: { $all: [userId, participantId] },
        $expr: { $eq: [{ $size: "$participants" }, 2] },
    };

    if (listingId) {
        query.listingId = listingId;
    }

    let conversation = await Conversation.findOne(query);

    const participantDetails = [];
    if (metadata.userName || metadata.userAvatar) {
        participantDetails.push({
            userId,
            name: metadata.userName || "User",
            avatar: metadata.userAvatar || "",
        });
    }
    if (metadata.participantName || metadata.participantAvatar) {
        participantDetails.push({
            userId: participantId,
            name: metadata.participantName || "User",
            avatar: metadata.participantAvatar || "",
        });
    }

    if (conversation) {
        if (metadata.listingTitle && !conversation.listingTitle) {
            conversation.listingTitle = metadata.listingTitle;
            await conversation.save();
        }
        return conversation;
    }

    conversation = await Conversation.create({
        participants: [userId, participantId],
        participantDetails,
        listingId: listingId || null,
        listingTitle: metadata.listingTitle || "",
    });

    return conversation;
};

const formatConversation = async (conversation, currentUserId) => {
    const doc = conversation.toObject ? conversation.toObject() : conversation;
    const otherId = doc.participants.find((p) => p !== currentUserId) || doc.participants[0] || "";
    const otherDetail = doc.participantDetails?.find((p) => p.userId === otherId);

    const unreadCount = await Message.countDocuments({
        conversationId: doc._id,
        receiverId: currentUserId,
        status: { $ne: "read" },
    });

    return {
        id: doc._id ? doc._id.toString() : doc.id,
        _id: doc._id,
        participants: doc.participants,
        participantId: otherId,
        participantName: otherDetail?.name || "Seller / Buyer",
        participantAvatar: otherDetail?.avatar || "",
        listingId: doc.listingId || "",
        listingTitle: doc.listingTitle || "",
        lastMessage: doc.lastMessage || "",
        lastMessageAt: doc.lastMessageAt || doc.updatedAt,
        unreadCount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};

const getUserConversations = async (userId) => {
    const list = await Conversation.find({
        participants: userId,
    }).sort({
        lastMessageAt: -1,
        updatedAt: -1,
    });

    return await Promise.all(list.map((c) => formatConversation(c, userId)));
};

const getConversationById = async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return await formatConversation(conversation, userId);
};

const updateLastMessage = async (conversationId, content) => {
    return Conversation.findByIdAndUpdate(
        conversationId,
        {
            lastMessage: content,
            lastMessageAt: new Date(),
        },
        { new: true }
    );
};

export {
    createConversation,
    getUserConversations,
    getConversationById,
    updateLastMessage,
    formatConversation,
};