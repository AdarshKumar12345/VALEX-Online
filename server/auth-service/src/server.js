import app from "./app.js";
import env from "./config/env.js";
import { connectRedis } from "./config/redis.js";

const PORT = env.PORT || 5001;

await connectRedis();

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});