
import prisma from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import redisClient from "../config/redis.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

const register = async ({ email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
  });

  // Store refresh token in Redis
  try {
    await redisClient.setEx(
      `refresh_token:${refreshToken}`,
      REFRESH_TOKEN_TTL,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        email: user.email,
      })
    );
  } catch (err) {
    console.error("Redis set error on register:", err.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    token: accessToken, // backwards compatibility
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
  });

  // Store refresh token in Redis
  try {
    await redisClient.setEx(
      `refresh_token:${refreshToken}`,
      REFRESH_TOKEN_TTL,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        email: user.email,
      })
    );
  } catch (err) {
    console.error("Redis set error on login:", err.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    token: accessToken, // backwards compatibility
  };
};

const refreshSession = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new Error("Refresh token is required");
  }

  // 1. Verify token signature & expiry
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  const userId = decoded.userId || decoded.id;

  // 2. Check Redis session
  let sessionData = null;
  try {
    const session = await redisClient.get(`refresh_token:${oldRefreshToken}`);
    if (session) {
      sessionData = JSON.parse(session);
    }
  } catch (err) {
    console.error("Redis get error on refresh:", err.message);
  }

  // 3. Find user in database
  const user = await prisma.user.findUnique({
    where: { id: userId || sessionData?.userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 4. Token rotation: revoke old refresh token and issue new token pair
  try {
    await redisClient.del(`refresh_token:${oldRefreshToken}`);
  } catch (err) {
    console.error("Redis del error on rotate:", err.message);
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
  });

  try {
    await redisClient.setEx(
      `refresh_token:${newRefreshToken}`,
      REFRESH_TOKEN_TTL,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        email: user.email,
      })
    );
  } catch (err) {
    console.error("Redis set error on rotate:", err.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken,
  };
};

const revokeSession = async (refreshToken) => {
  if (refreshToken) {
    try {
      await redisClient.del(`refresh_token:${refreshToken}`);
    } catch (err) {
      console.error("Redis del error on logout:", err.message);
    }
  }
};

export { register, login, refreshSession, revokeSession };