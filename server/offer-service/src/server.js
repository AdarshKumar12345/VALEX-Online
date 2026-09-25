import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import offerRoutes from "./routes/offer.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "offer-service",
        status: "running",
    });
});


app.use("/api/offers", offerRoutes);
app.use("/offers", offerRoutes)
app.use("/", offerRoutes)


const PORT = process.env.PORT || 5005;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Offer service running on port ${PORT}`);
    });
};

startServer();