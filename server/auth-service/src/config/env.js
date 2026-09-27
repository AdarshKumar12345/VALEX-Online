import dotenv from "dotenv";
dotenv.config();

const env = {
  PORT: process.env.PORT || 5001,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "your-super-secret-refresh-key",
};

export default env;