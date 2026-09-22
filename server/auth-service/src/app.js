import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service running",
  });
});

// Auth routes
app.use("/auth", authRoutes);
app.use("/", authRoutes);

export default app;