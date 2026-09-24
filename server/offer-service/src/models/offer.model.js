import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
    {
        listingId: {
            type: String,
            required: true,
            index: true,
        },

        buyerId: {
            type: String,
            required: true,
            index: true,
        },

        sellerId: {
            type: String,
            required: true,
            index: true,
        },

        listingTitle: {
            type: String,
            default: "Listing",
            trim: true,
        },

        listingPrice: {
            type: Number,
            default: 0,
        },

        buyerName: {
            type: String,
            default: "Buyer",
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 1,
        },

        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "countered",
                "expired",
                "withdrawn",
            ],
            default: "pending",
            lowercase: true,
        },

        parentOfferId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
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

export default mongoose.model("Offer", offerSchema);