import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
        },

        authId: {
            type: String,
            index: true,
        },

        name: {
            type: String,
            default: "User",
            trim: true,
        },

        email: {
            type: String,
            sparse: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: false,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        avatar: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        location: {
            type: mongoose.Schema.Types.Mixed,
            default: "",
        },
    },
    {
        timestamps: true,
        _id: false,
    }
);

const User = mongoose.model("User", userSchema);

export default User;