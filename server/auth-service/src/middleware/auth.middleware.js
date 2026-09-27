import redisClient from "../config/redis.js";
import { verifyToken } from "../utils/jwt.util.js";


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const session = await redisClient.get(`session:${token}`);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or logged out",
      });
    }
    const sessionData = JSON.parse(session);
    req.user = {
      userId: sessionData.userId,
      email: sessionData.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authenticate;