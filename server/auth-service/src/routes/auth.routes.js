import express from "express";
import { register, login, getMe, refresh, logout } from "../controllers/auth.controller.js";
import {
  registerSchema,
  loginSchema,
  validate,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.get("/refresh", refresh);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;



