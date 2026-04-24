// src/services/chat.service.ts

import { AppError } from "../middleware/errorHandler";
import { createEmbedding } from "./embedding.service";
import { groqChat } from "./groq.service";

import {
  detectChatIntent,
  getQuickReply,
  getGeneralReply,
} from "../utils/chatIntent";

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
  addDocumentToChat,
} from "../repositories/chat.repository";

type UploadedFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
};

export const createChatService =
  async (
    userId: string,
    documentIds: string[] = [],
    title: string
  ) => {
    return await createChat({
      userId,
      documentIds,
      title,
    });
  };

export const getChatDocumentsService =
  async (
    chatId: string,
    userId: string
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

    if (
      !chat.documentIds ||
      chat.documentIds.length ===
        0
    ) {
      return [];
    }

    return await findReadyDocumentsByIds(
      userId,
      chat.documentIds.map((id) =>
        id.toString()
      )
    );
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
        fileName:
          file.filename,
        mimeType:
          file.mimetype,
        size: file.size,
        path: file.path,
      });

    await addDocumentToChat(
      chatId,
      document._id.toString()
    );

    chat.messages.push({
      role: "user",
      type: "document",
      content: "",
      document: {
        _id: document._id,
        originalName:
          document.originalName,
        mimeType:
          document.mimeType,
        size: document.size,
      },
    } as any);

    await saveChat(chat);

    return {
      chatId,
      document,
      chat,
    };
  };

export const sendMessageService =
  async (
    chatId: string,
    userId: string,
    userMessage: string
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

    const intent =
      detectChatIntent(
        userMessage
      );

    chat.messages.push({
      role: "user",
      content: userMessage,
    });

    if (
      intent === "casual"
    ) {
      chat.messages.push({
        role: "assistant",
        content:
          getQuickReply(
            userMessage
          ),
      });

      await saveChat(chat);
      return chat;
    }

    if (
      intent === "general"
    ) {
      chat.messages.push({
        role: "assistant",
        content:
          getGeneralReply(),
      });

      await saveChat(chat);
      return chat;
    }

    if (
      !chat.documentIds ||
      chat.documentIds.length ===
        0
    ) {
      chat.messages.push({
        role: "assistant",
        content:
          "I'm your document assistant. Please upload a file first.",
      });

      await saveChat(chat);
      return chat;
    }

    const embedding =
      await createEmbedding(
        userMessage
      );

    const similarChunks =
      await findSimilarChunks(
        chat.documentIds.map(
          (id) =>
            id.toString()
        ),
        embedding,
        5
      );

    const context =
      similarChunks.length > 0
        ? similarChunks
            .map(
              (chunk) =>
                chunk.text
            )
            .join("\n\n")
        : "No relevant context found.";

    const history =
      chat.messages
        .filter(
          (msg: any) =>
            msg.type !==
              "document" &&
            msg.content?.trim()
        )
        .slice(-10)
        .map((msg: any) => ({
          role: msg.role,
          content:
            msg.content,
        }));

    const assistantMessage =
      await groqChat(
        userMessage,
        context,
        history
      );

    chat.messages.push({
      role: "assistant",
      content:
        assistantMessage,
      relatedChunks:
        similarChunks.map(
          (chunk) =>
            chunk._id
        ),
    });

    await saveChat(chat);

    return chat;
  };

export const getChatsService =
  async (
    userId: string
  ) => {
    return await findChatsByUserId(
      userId
    );
  };

export const getChatService =
  async (
    chatId: string,
    userId: string
  ) => {
    const chat =
      await findChatByIdWithChunks(
        chatId
      );

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

    return chat;
  };

export const deleteChatService =
  async (
    chatId: string,
    userId: string
  ) => {
    const chat =
      await deleteChatById(
        chatId
      );

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
  };

const findSimilarChunks =
  async (
    documentIds: string[],
    embedding: number[],
    limit: number
  ) => {
    const chunks =
      await findChunksByDocumentIds(
        documentIds
      );

    const scored =
      chunks.map(
        (chunk: any) => ({
          ...chunk.toObject(),
          score:
            cosineSimilarity(
              embedding,
              chunk.embedding
            ),
        })
      );

    return scored
      .sort(
        (a, b) =>
          b.score -
          a.score
      )
      .slice(0, limit);
  };

const cosineSimilarity = (
  a: number[],
  b: number[]
) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return (
    dot /
    (Math.sqrt(normA) *
      Math.sqrt(normB))
  );
};