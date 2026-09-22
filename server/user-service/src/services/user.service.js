import User from "../models/user.model.js";

export const getUserById = async (userId) => {
    return await User.findById(userId).select("-password");
};

export const updateUser = async (userId, data) => {
    return await User.findByIdAndUpdate(
        userId,
        data,
        { new: true, runValidators: true }
    ).select("-password");
};

export const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};