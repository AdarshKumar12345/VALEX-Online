import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();
const redisurl = process.env.REDIS_URL || "redis://localhost:6379";


const redisClient = createClient({
    url: redisurl,

});
const redisPublisher = createClient({
    url: redisurl,
})
const redisSubscriber = createClient({
    url: redisurl,
})

// -------------------------
// Error handlers
// -------------------------

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

redisPublisher.on("error", (err) => {
    console.error("Redis Publisher Error:", err);
});

redisSubscriber.on("error", (err) => {
    console.error("Redis Subscriber Error:", err);
});

// Connect all Redis clients
// -------------------------

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    if (!redisPublisher.isOpen) {
        await redisPublisher.connect();
    }

    if (!redisSubscriber.isOpen) {
        await redisSubscriber.connect();
    }

    console.log("Redis connected");
};

// -------------------------
// Exports
// -------------------------

export {
    redisPublisher,
    redisSubscriber,
};

export default redisClient;