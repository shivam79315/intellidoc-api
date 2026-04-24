// src/config/redis.ts
import IORedis from "ioredis";
import { env } from "./env";

export const redisConnection = new IORedis(
  env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  }
);

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error) => {
  console.error("Redis error:", error);
});