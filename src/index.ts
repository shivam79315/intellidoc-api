import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import connectDB from "./config/db";
import { env } from "./config/env";

import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";
import userRoutes from "./routes/user.routes";

import { errorHandler, AppError } from "./middleware/errorHandler";

const app = express();

connectDB();

app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

// 404 handler
app.use((req, res, next) => {
  throw new AppError(404, "Route not found");
});

// Error handler
app.use(errorHandler);

app.listen(parseInt(process.env.PORT || "5000"), () => {
  console.log(`Server running`);
});