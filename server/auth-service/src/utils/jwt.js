import jwt from "jsonwebtoken";
import env from "../config/env.js";

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export { generateToken, verifyToken };