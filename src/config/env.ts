// config/env.ts
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  CLIENT_URLS: process.env.CLIENT_URLS || 'http://localhost:3000',
  REDIS_URL: process.env.REDIS_URL,
  MONGO_URI: requiredEnv("MONGO_URI"),
  JWT_SECRET: requiredEnv("JWT_SECRET"),

  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",

  IS_PRODUCTION: process.env.NODE_ENV === "production",

  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || "https://api.groq.com",

  LOG_LEVEL: 'info',
  BATCH_SIZE: process.env.BATCH_SIZE || "50",
  EMBEDDING_BATCH_SIZE: process.env.EMBEDDING_BATCH_SIZE || "5",
  CHUNK_SIZE: process.env.CHUNK_SIZE || "300",
};