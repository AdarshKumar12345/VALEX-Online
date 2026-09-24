import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        senderId: {
            type: String,
            required: true,
            index: true
        },

        receiverId: {
            type: String,
            index: true,
            default: null,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        messageType: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text",
        },

        attachmentUrl: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },

        readAt: {
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
                ret.text = ret.content || ret.text || "";
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                ret.text = ret.content || ret.text || "";
                return ret;
            },
        },
    }
);

messageSchema.index({
    conversationId: 1,
    createdAt: -1
});

const Message = mongoose.model("Message", messageSchema);

export default Message;