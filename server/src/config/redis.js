import { createClient } from "redis";

let redisClient = null;

export const initializeRedis = async () => {
  try {
    const host = process.env.REDIS_HOST || "localhost";
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD;

    // Build Redis URL - handle both local and cloud Redis
    let url;
    if (password) {
      // Redis Cloud format: redis://:[password]@[host]:[port]
      url = `redis://:${password}@${host}:${port}`;
    } else {
      // Local Redis format: redis://[host]:[port]
      url = `redis://${host}:${port}`;
    }

    redisClient = createClient({
      url: url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis Connected");
    });

    redisClient.on("ready", () => {
      console.log("Redis Ready");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log("Redis Disconnected");
  }
};
