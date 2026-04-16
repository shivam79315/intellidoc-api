import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import {
  createChatService,
  sendMessageService,
  getChatsService,
  getChatService,
  deleteChatService,
} from "../services/chat.service";

export const createChat = async (req: Request, res: Response) => {
  const { documentIds, title } = req.body;
  const userId = (req as any).userId;

  if (
    !documentIds ||
    !Array.isArray(documentIds) ||
    documentIds.length === 0 ||
    !title
  ) {
    throw new AppError(400, "documentIds array and title required");
  }

  const chat = await createChatService(userId, documentIds, title);

  res.status(201).json({ data: chat });
};

export const sendMessage = async (req: Request<{ chatId: string }>, res: Response) => {
  const { chatId } = req.params;
  const { message } = req.body;
  const userId = (req as any).userId;

  if (!message) {
    throw new AppError(400, "Message required");
  }

  const updatedChat = await sendMessageService(chatId, userId, message);

  res.status(200).json({ data: updatedChat });
};

export const getChats = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const chats = await getChatsService(userId);

  res.status(200).json({ data: chats });
};

export const getChat = async (req: Request<{ chatId: string }>, res: Response) => {
  const { chatId } = req.params;
  const userId = (req as any).userId;

  const chat = await getChatService(chatId, userId);

  res.status(200).json({ data: chat });
};

export const deleteChat = async (req: Request<{ chatId: string }>, res: Response) => {
  const { chatId } = req.params;
  const userId = (req as any).userId;

  await deleteChatService(chatId, userId);

  res.status(200).json({ message: "Chat deleted" });
};