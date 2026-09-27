
import prisma from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateToken } from "../utils/jwt.util.js";
import redisClient from "../config/redis.js";

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

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  await redisClient.setEx(
    `session:${token}`,
    60 * 60 * 24 * 7, // 7 days
    JSON.stringify({
      userId: user.id,
      role: user.role,
    })

  )

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
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

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  await redisClient.setEx(
    `session:${token}`,
    60 * 60 * 24 * 7, // 7 days
    JSON.stringify({
      userId: user.id,
      role: user.role,
    })

  )

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export { register, login };