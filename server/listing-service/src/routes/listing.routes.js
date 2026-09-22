import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    create,
    getAll,
    getOne,
    update,
    remove,
} from "../controllers/listing.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);

router.post("/", authMiddleware, upload.array("images", 8), create);
router.put("/:id", authMiddleware, upload.array("images", 8), update);
router.delete("/:id", authMiddleware, remove);

export default router;