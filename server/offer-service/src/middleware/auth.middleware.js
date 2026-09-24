import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const cookieToken =
            req.cookies?.token ||
            (req.headers.cookie &&
                req.headers.cookie
                    .split(";")
                    .map((c) => c.trim())
                    .find((c) => c.startsWith("token="))
                    ?.split("=")[1]);

        const headerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null;

        const token = cookieToken || headerToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId || decoded.id;

        req.user = {
            ...decoded,
            id: userId,
            userId: userId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};