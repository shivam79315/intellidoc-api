import { AppError } from "../middleware/errorHandler";
import Chat from "../models/Chat";
import Document from "../models/Document";
import Chunk from "../models/Chunk";
import { createEmbedding } from "./embedding.service";
import { groqChat } from "./groq.service";

export const createChatService = async (
  userId: string,
  documentId: string,
  title: string
) => {
  const doc = await Document.findById(documentId);

  if (!doc || doc.userId.toString() !== userId) {
    throw new AppError(404, "Document not found");
  }

  if (doc.status !== "ready") {
    throw new AppError(400, "Document not processed yet");
  }

  const chat = await Chat.create({
    userId,
    documentId,
    title,
    messages: [],
  });

  return chat;
};

export const sendMessageService = async (
  chatId: string,
  userId: string,
  userMessage: string
) => {
  const chat = await Chat.findById(chatId);

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }

  // Get user embedding
  const userEmbedding = await createEmbedding(userMessage);

  // Find similar chunks
  const similarChunks = await findSimilarChunks(
    chat.documentId.toString(),
    userEmbedding,
    5
  );

  const context = similarChunks.map((c) => c.text).join("\n\n");

  // Get Groq response
  const assistantMessage = await groqChat(userMessage, context);

  // Save messages
  chat.messages.push({
    role: "user",
    content: userMessage,
    relatedChunks: similarChunks.map((c) => c._id),
  });

  chat.messages.push({
    role: "assistant",
    content: assistantMessage,
  });

  await chat.save();

  return chat;
};

export const getChatsService = async (userId: string) => {
  const chats = await Chat.find({ userId })
    .select("title createdAt documentId")
    .sort({ createdAt: -1 });

  return chats;
};

export const getChatService = async (chatId: string, userId: string) => {
  const chat = await Chat.findById(chatId).populate("messages.relatedChunks");

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }

  return chat;
};

export const deleteChatService = async (chatId: string, userId: string) => {
  const chat = await Chat.findByIdAndDelete(chatId);

  if (!chat || chat.userId.toString() !== userId) {
    throw new AppError(404, "Chat not found");
  }
};

const findSimilarChunks = async (
  documentId: string,
  embedding: number[],
  limit: number
) => {
  const chunks = await Chunk.find({ documentId });

  const scored = chunks.map((chunk) => ({
    ...chunk.toObject(),
    score: cosineSimilarity(embedding, chunk.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};