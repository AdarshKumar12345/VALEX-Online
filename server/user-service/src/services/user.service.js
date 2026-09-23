import User from "../models/user.model.js";

export const getUserById = async (userId, email = "") => {
    if (!userId) return null;

    let user = await User.findOne({
        $or: [{ _id: String(userId) }, { authId: String(userId) }],
    }).select("-password");

    if (!user) {
        user = await User.create({
            _id: String(userId),
            authId: String(userId),
            name: email ? email.split("@")[0] : "MarketX User",
            email: email || `${userId}@user.marketx`,
        });
    }

    return user;
};

export const updateUser = async (userId, data) => {
    if (!userId) return null;

    return await User.findOneAndUpdate(
        { $or: [{ _id: String(userId) }, { authId: String(userId) }] },
        { ...data, authId: String(userId) },
        { new: true, upsert: true, runValidators: false }
    ).select("-password");
};

export const deleteUser = async (userId) => {
    if (!userId) return null;

    return await User.findOneAndDelete({
        $or: [{ _id: String(userId) }, { authId: String(userId) }],
    });
};