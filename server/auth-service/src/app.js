import express from "express";
import cors from "cors";

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth service running" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

export default app;