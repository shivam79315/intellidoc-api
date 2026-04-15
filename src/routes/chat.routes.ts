import express from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import {
  createChat,
  sendMessage,
  getChats,
  getChat,
  deleteChat,
} from "../controllers/chat.controller";

const router = express.Router();

router.use(authMiddleware);

router.post("/", asyncHandler(createChat));
router.get("/", asyncHandler(getChats));
router.get("/:chatId", asyncHandler(getChat));
router.post("/:chatId/message", asyncHandler(sendMessage));
router.delete("/:chatId", asyncHandler(deleteChat));

export default router;