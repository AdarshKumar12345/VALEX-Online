import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        sellerId: {
            type: String,
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        category: {
            type: String,
            required: true,
            index: true,
        },

        images: [
            {
                type: String,
            },
        ],

        condition: {
            type: String,
            enum: ["new", "like-new", "good", "fair"],
            required: true,
        },

        location: {
            city: String,
            state: String,
            country: String,
        },

        status: {
            type: String,
            enum: ["active", "sold", "inactive"],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;