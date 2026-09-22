import {
    getUserById,
    updateUser,
    deleteUser,
} from "../services/user.service.js";

export const getMe = async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMe = async (req, res) => {
    try {
        const user = await updateUser(req.user.userId, req.body);

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMe = async (req, res) => {
    try {
        await deleteUser(req.user.userId);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};