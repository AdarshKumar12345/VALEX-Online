import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "user-service",
    });
});

app.use("/api/users", userRoutes);
app.use("/users", userRoutes);
app.use("/", userRoutes);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();

