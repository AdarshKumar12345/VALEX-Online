import {
    createConversation,
    getUserConversations,
    getConversationById,
    formatConversation,
} from "../services/chat.service.js";

const createChat = async (req, res) => {
    try {
        let { participantId, recipientId, listingId, listingTitle, participantName, participantAvatar } = req.body;
        let targetParticipant = participantId || recipientId;

        // 1. If listingId is provided, try to look up the listing and seller
        if (listingId) {
            try {
                const listingServiceUrl = process.env.LISTING_SERVICE_URL || "http://localhost:5003";
                const listingRes = await fetch(`${listingServiceUrl}/listings/${listingId}`);
                if (listingRes.ok) {
                    const data = await listingRes.json();
                    const listing = data.listing || data.data || data;
                    if (listing) {
                        if (!targetParticipant) {
                            targetParticipant = listing.sellerId || listing.seller?.id || listing.seller?._id || listing.seller?.authId;
                        }
                        if (!listingTitle) listingTitle = listing.title;
                        if (!participantName) participantName = listing.seller?.name;
                        if (!participantAvatar) participantAvatar = listing.seller?.avatar;
                    }
                }
            } catch (err) {
                console.error("Listing lookup error in createChat:", err.message);
            }
        }

        // 2. Look up targetParticipant details from User Service
        if (targetParticipant) {
            try {
                const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
                const userRes = await fetch(`${userServiceUrl}/users/${targetParticipant}`);
                if (userRes.ok) {
                    const data = await userRes.json();
                    const user = data.user || data.data || data;
                    if (user) {
                        targetParticipant = user._id || user.authId || user.id || targetParticipant;
                        if (!participantName || participantName === "Seller / Buyer" || participantName === "User") {
                            participantName = user.name || participantName;
                        }
                        if (!participantAvatar) {
                            participantAvatar = user.avatar || participantAvatar;
                        }
                    }
                }
            } catch (error) {
                console.error("User lookup error in createChat:", error.message);
            }
        }

        if (!targetParticipant) {
            return res.status(400).json({
                success: false,
                message: "participantId or recipientId is required",
            });
        }

        // 3. Look up current logged-in user details from User Service
        let currentUserName = req.user.name;
        let currentUserAvatar = req.user.avatar;
        try {
            const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
            const meRes = await fetch(`${userServiceUrl}/users/${req.user.id}`);
            if (meRes.ok) {
                const meData = await meRes.json();
                const meUser = meData.user || meData.data || meData;
                if (meUser) {
                    currentUserName = meUser.name || currentUserName;
                    currentUserAvatar = meUser.avatar || currentUserAvatar;
                }
            }
        } catch (err) {
            console.error("Current user lookup error in createChat:", err.message);
        }

        const conversation = await createConversation(
            req.user.id,
            targetParticipant,
            listingId,
            {
                listingTitle,
                participantName: participantName || "User",
                participantAvatar: participantAvatar || "",
                userName: currentUserName || req.user.name || req.user.email?.split("@")[0] || "User",
                userAvatar: currentUserAvatar || "",
            }
        );

        const formatted = await formatConversation(conversation, req.user.id);

        return res.status(201).json({
            success: true,
            message: "Conversation created",
            chat: formatted,
            data: formatted,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getChats = async (req, res) => {
    try {
        const conversations = await getUserConversations(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            chats: conversations,
            data: conversations,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getChat = async (req, res) => {
    try {
        const conversation = await getConversationById(
            req.params.conversationId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            chat: conversation,
            data: conversation,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    createChat,
    getChats,
    getChat,
};