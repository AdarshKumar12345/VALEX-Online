import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: String,
                required: true,
            },
        ],

        participantDetails: [
            {
                userId: { type: String, required: true },
                name: { type: String, default: "User" },
                avatar: { type: String, default: "" },
            },
        ],

        listingId: {
            type: String,
            default: null,
        },

        listingTitle: {
            type: String,
            default: "",
        },

        lastMessage: {
            type: String,
            default: null,
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                return ret;
            },
        },
    }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ listingId: 1 });

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

export default Conversation;