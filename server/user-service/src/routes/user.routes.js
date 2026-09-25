import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMe, updateMe, deleteMe, getOtherUserById, createUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, deleteMe);

router.get("/:id", getOtherUserById);

router.post("/internal/users", createUserProfile);


export default router;
