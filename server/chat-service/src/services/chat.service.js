import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    try {
        const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
        const res = await fetch(`${userServiceUrl}/users/${userId}`);
        if (res.ok) {
            const data = await res.json();
            return data.user || data.data || data;
        }
    } catch {
        // ignore network error
    }
    return null;
};

const createConversation = async (userId, participantId, listingId, metadata = {}) => {
    if (!participantId && !listingId) {
        throw new Error("participantId or listingId is required");
    }

    if (participantId && String(userId) === String(participantId)) {
        throw new Error("You cannot start a conversation with yourself");
    }

    const query = {
        participants: { $all: [String(userId), String(participantId)] },
        $expr: { $eq: [{ $size: "$participants" }, 2] },
    };

    if (listingId) {
        query.listingId = String(listingId);
    }

    let conversation = await Conversation.findOne(query);

    const participantDetails = [];
    if (metadata.userName || metadata.userAvatar) {
        participantDetails.push({
            userId: String(userId),
            name: metadata.userName || "User",
            avatar: metadata.userAvatar || "",
        });
    }
    if (metadata.participantName || metadata.participantAvatar) {
        participantDetails.push({
            userId: String(participantId),
            name: metadata.participantName || "User",
            avatar: metadata.participantAvatar || "",
        });
    }

    if (conversation) {
        let updated = false;
        if (metadata.listingTitle && !conversation.listingTitle) {
            conversation.listingTitle = metadata.listingTitle;
            updated = true;
        }
        if (participantDetails.length > 0) {
            if (!conversation.participantDetails || conversation.participantDetails.length === 0) {
                conversation.participantDetails = participantDetails;
                updated = true;
            } else {
                for (const pd of participantDetails) {
                    const idx = conversation.participantDetails.findIndex((p) => String(p.userId) === String(pd.userId));
                    if (idx === -1) {
                        conversation.participantDetails.push(pd);
                        updated = true;
                    } else if (
                        pd.name &&
                        pd.name !== "User" &&
                        (!conversation.participantDetails[idx].name ||
                            conversation.participantDetails[idx].name === "User" ||
                            conversation.participantDetails[idx].name === "Seller / Buyer")
                    ) {
                        conversation.participantDetails[idx].name = pd.name;
                        if (pd.avatar) conversation.participantDetails[idx].avatar = pd.avatar;
                        updated = true;
                    }
                }
            }
        }
        if (updated) {
            await conversation.save();
        }
        return conversation;
    }

    conversation = await Conversation.create({
        participants: [String(userId), String(participantId)],
        participantDetails,
        listingId: listingId || null,
        listingTitle: metadata.listingTitle || "",
    });

    return conversation;
};

const formatConversation = async (conversation, currentUserId) => {
    const doc = conversation.toObject ? conversation.toObject() : conversation;
    const otherId = doc.participants.find((p) => String(p) !== String(currentUserId)) || doc.participants[0] || "";
    let otherDetail = doc.participantDetails?.find((p) => String(p.userId) === String(otherId));

    let participantName = otherDetail?.name;
    let participantAvatar = otherDetail?.avatar || "";

    // If participant name is missing or generic default, fetch live from User Service
    if (!participantName || participantName === "Seller / Buyer" || participantName === "User") {
        const userProfile = await fetchUserProfile(otherId);
        if (userProfile && userProfile.name) {
            participantName = userProfile.name;
            participantAvatar = userProfile.avatar || participantAvatar;

            // Cache into conversation record in MongoDB
            try {
                const existingDetail = await Conversation.findOne({
                    _id: doc._id,
                    "participantDetails.userId": String(otherId),
                });

                if (existingDetail) {
                    await Conversation.updateOne(
                        { _id: doc._id, "participantDetails.userId": String(otherId) },
                        {
                            $set: {
                                "participantDetails.$.name": participantName,
                                "participantDetails.$.avatar": participantAvatar,
                            },
                        }
                    );
                } else {
                    await Conversation.findByIdAndUpdate(doc._id, {
                        $push: {
                            participantDetails: {
                                userId: String(otherId),
                                name: participantName,
                                avatar: participantAvatar,
                            },
                        },
                    });
                }
            } catch (err) {
                console.error("Failed to update participantDetails in DB:", err.message);
            }
        }
    }

    if (!participantName || participantName === "Seller / Buyer") {
        participantName = "User";
    }

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
        participantName,
        participantAvatar,
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
        participants: String(userId),
    }).sort({
        lastMessageAt: -1,
        updatedAt: -1,
    });

    return await Promise.all(list.map((c) => formatConversation(c, userId)));
};

const getConversationById = async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: String(userId),
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