import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    if (result.token) {
      res.cookie("token", result.token, COOKIE_OPTIONS);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.user,
      token: result.token,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    if (result.token) {
      res.cookie("token", result.token, COOKIE_OPTIONS);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const secret = process.env.JWT_SECRET || "your-super-secret-key";
    const decoded = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.email.split("@")[0],
        email: user.email,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt,
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
