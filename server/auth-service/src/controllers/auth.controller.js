import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    if (result.user?.id) {
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
        await fetch(`${userServiceUrl}/internal/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_SERVICE_SECRET || "INTERNAL_SERVICE_SECRET",
          },
          body: JSON.stringify({
            id: result.user.id,
            name: result.user.name || req.body.name || "",
            email: result.user.email,
          }),
        });
      } catch (error) {
        console.error("Failed to create User Service profile:", error.message);
      }
    }

    if (result.accessToken) {
      res.cookie("token", result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    }

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    if (result.accessToken) {
      res.cookie("token", result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    }

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers["x-refresh-token"];

    if (!refreshToken) {
      res.clearCookie("token", ACCESS_COOKIE_OPTIONS);
      res.clearCookie("access_token", ACCESS_COOKIE_OPTIONS);
      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    const result = await authService.refreshSession(refreshToken);

    res.cookie("token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.clearCookie("token", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("access_token", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired refresh token",
    });
  }
};

export const getMe = async (req, res) => {
  const token =
    req.cookies?.token ||
    req.cookies?.access_token ||
    req.headers.authorization?.split(" ")[1];

  const refreshToken =
    req.cookies?.refreshToken ||
    req.headers["x-refresh-token"];

  // 1. Try to verify access token
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "your-super-secret-key";
      const decoded = jwt.verify(token, secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId || decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (user) {
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            name: user.email.split("@")[0],
            email: user.email,
            role: user.role.toLowerCase(),
            createdAt: user.createdAt,
          },
        });
      }
    } catch {
      // Access token expired, fallback to refresh below
    }
  }

  // 2. If access token is expired or missing, check refresh token
  if (refreshToken) {
    try {
      const result = await authService.refreshSession(refreshToken);

      res.cookie("token", result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return res.status(200).json({
        success: true,
        user: {
          id: result.user.id,
          name: result.user.email.split("@")[0],
          email: result.user.email,
          role: result.user.role.toLowerCase(),
        },
      });
    } catch {
      // Refresh token also invalid/expired
    }
  }

  res.clearCookie("token", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("access_token", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

  return res.status(401).json({
    success: false,
    message: "Invalid or expired session",
  });
};

export const logout = async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken;

  if (refreshToken) {
    await authService.revokeSession(refreshToken);
  }

  res.clearCookie("token", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("access_token", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
