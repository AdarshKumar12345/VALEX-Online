import {
    getUserById,
    updateUser,
    deleteUser,
    findOtherUserById,
    createUser
} from "../services/user.service.js";

export const getMe = async (req, res) => {
    try {
        const user = await getUserById(req.user.userId, req.user.email);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

export const getOtherUserById = async (req, res) => {
    try {
        const user = await findOtherUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const createUserProfile = async (req, res) => {
    try {
        // Verify this request came from Auth Service
        if (
            req.headers["x-internal-secret"] !==
            process.env.INTERNAL_SERVICE_SECRET
        ) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await createUser({
            id: req.body.id,
            name: req.body.name,
            email: req.body.email,
        });

        return res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Create user profile error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};