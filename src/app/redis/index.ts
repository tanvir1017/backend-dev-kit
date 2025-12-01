import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
    return redisClient;
  } catch (error) {
    console.error("❌ Redis connection error:", error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.disconnect();
    console.log("Redis connection closed");
  }
};
