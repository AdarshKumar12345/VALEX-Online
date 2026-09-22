import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMe, updateMe, deleteMe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, deleteMe);

export default router;
