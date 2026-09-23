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
            default: "good",
        },

        location: {
            type: mongoose.Schema.Types.Mixed,
            default: "Location not specified",
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