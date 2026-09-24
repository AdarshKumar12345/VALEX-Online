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

        // If participantId not provided but listingId is, try to look up the listing seller
        if (!targetParticipant && listingId) {
            try {
                const listingRes = await fetch(`http://localhost:5003/listings/${listingId}`);
                if (listingRes.ok) {
                    const data = await listingRes.json();
                    const listing = data.listing || data.data || data;
                    targetParticipant = listing.sellerId || listing.seller?.id;
                    if (!listingTitle) listingTitle = listing.title;
                }
            } catch {
                // proceed with what we have
            }
        }

        if (!targetParticipant) {
            return res.status(400).json({
                success: false,
                message: "participantId or recipientId is required",
            });
        }

        const conversation = await createConversation(
            req.user.id,
            targetParticipant,
            listingId,
            {
                listingTitle,
                participantName,
                participantAvatar,
                userName: req.user.name || req.user.email?.split("@")[0] || "User",
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