// src/services/chat.service.ts

import { AppError } from "../middleware/errorHandler";
import { createEmbedding } from "./embedding.service";
import { groqChat } from "./groq.service";

import {
  createChat,
  findReadyDocumentsByIds,
  findChatById,
  findChatsByUserId,
  findChatByIdWithChunks,
  deleteChatById,
  findChunksByDocumentIds,
  saveChat,
  createChatDocument,
  addDocumentToChat
} from "../repositories/chat.repository";

type UploadedFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
};

export const createChatService = async (
  userId: string,
  documentIds: string[] = [],
  title: string
) => {
  if (documentIds.length > 0) {
    const docs = await findReadyDocumentsByIds(
      userId,
      documentIds
    );

    if (docs.length !== documentIds.length) {
      throw new AppError(404, "Document not found");
    }
  }

  return await createChat({
    userId,
    documentIds,
    title,
  });
};

export const uploadChatDocumentService =
  async (
    chatId: string,
    userId: string,
    file: UploadedFile
  ) => {
    const chat =
      await findChatById(chatId);

    if (
      !chat ||
      chat.userId.toString() !==
        userId
    ) {
      throw new AppError(
        404,
        "Chat not found"
      );
    }

    const document =
      await createChatDocument({
        userId,
        originalName:
          file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      });

    await addDocumentToChat(
      chatId,
      document._id.toString()
    );

    return {
      chatId,
      document,
    };
  };

export const sendMessageService = async (
  chatId: string,
  userId: string,
  userMessage: string
) => {
  const chat = await findChatById(chatId);

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }

  if (!chat.documentIds || chat.documentIds.length === 0) {
    throw new AppError(
      400,
      "No documents attached to this chat"
    );
  }

  const userEmbedding = await createEmbedding(userMessage);

  const similarChunks = await findSimilarChunks(
    chat.documentIds.map((id) => id.toString()),
    userEmbedding,
    5
  );

  const context = similarChunks.length
    ? similarChunks.map((chunk) => chunk.text).join("\n\n")
    : "No relevant context found in uploaded documents.";

  const assistantMessage = await groqChat(
    userMessage,
    context
  );

  chat.messages.push({
    role: "user",
    content: userMessage,
    relatedChunks: similarChunks.map(
      (chunk) => chunk._id
    ),
  });

  chat.messages.push({
    role: "assistant",
    content: assistantMessage,
  });

  await saveChat(chat);

  return chat;
};

export const getChatsService = async (
  userId: string
) => {
  return await findChatsByUserId(userId);
};

export const getChatService = async (
  chatId: string,
  userId: string
) => {
  const chat = await findChatByIdWithChunks(chatId);

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }

  return chat;
};

export const deleteChatService = async (
  chatId: string,
  userId: string
) => {
  const chat = await deleteChatById(chatId);

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }
};

const findSimilarChunks = async (
  documentIds: string[],
  embedding: number[],
  limit: number
) => {
  if (!documentIds || documentIds.length === 0) {
    return [];
  }

  const chunks = await findChunksByDocumentIds(
    documentIds
  );

  const scored = chunks.map((chunk: any) => ({
    ...chunk.toObject(),
    score: cosineSimilarity(
      embedding,
      chunk.embedding
    ),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const cosineSimilarity = (
  a: number[],
  b: number[]
): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return (
    dotProduct /
    (Math.sqrt(normA) * Math.sqrt(normB))
  );
};