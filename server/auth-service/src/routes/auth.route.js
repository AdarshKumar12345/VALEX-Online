import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import {
  registerSchema,
  loginSchema,
  validate,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;



