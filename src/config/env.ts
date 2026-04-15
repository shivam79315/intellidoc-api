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
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGO_URI: requiredEnv("MONGO_URI"),
  JWT_SECRET: requiredEnv("JWT_SECRET"),

  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",

  IS_PRODUCTION: process.env.NODE_ENV === "production",

  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || "https://api.groq.com",
};