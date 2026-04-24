import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import {
  createChatService,
  sendMessageService,
  uploadChatDocumentService,
  getChatsService,
  getChatDocumentsService,
  getChatService,
  deleteChatService,
} from "../services/chat.service";

import { processDocument } from "../services/processDocument.service";

type UploadedFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
};

export const createChat = async (req: Request, res: Response) => {
  const { documentIds, title } = req.body;
  const userId = (req as any).userId;

  if (!title) {
    throw new AppError(400, "title required");
  }

  if (documentIds && !Array.isArray(documentIds)) {
    throw new AppError(400, "documentIds must be array");
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

export const uploadChatDocument = async (
  req: AuthRequest,
  res: Response
) => {
  const request = req as AuthRequest & {
    file?: UploadedFile;
    params: { chatId: string };
  };

  if (!request.userId) {
    throw new AppError(
      401,
      "Not authorized"
    );
  }

  if (!request.file) {
    throw new AppError(
      400,
      "File is required"
    );
  }

  const result =
    await uploadChatDocumentService(
      request.params.chatId,
      request.userId,
      request.file
    );

  processDocument(
    result.document._id.toString()
  ).catch(console.error);

  res.status(201).json({
    data: result,
  });
};

export const getChats = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const chats = await getChatsService(userId);

  res.status(200).json({ data: chats });
};

export const getChatDocuments = async (
  req: Request<{ chatId: string }>,
  res: Response
) => {
  const { chatId } = req.params;
  const userId = (req as any).userId;

  if (!userId) {
    throw new AppError(401, "Not authorized");
  }

  const documents = await getChatDocumentsService(chatId, userId);

  res.status(200).json({
    data: documents,
  });
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