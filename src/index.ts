import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { env } from "./config/env";

import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";
import userRoutes from "./routes/user.routes";

import { errorHandler, AppError } from "./middleware/errorHandler";

const app = express();

connectDB();

const allowedOrigins = env.CLIENT_URLS
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

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

app.listen(parseInt(env.PORT || "5000"), () => {
  console.log(`Server running`);
});