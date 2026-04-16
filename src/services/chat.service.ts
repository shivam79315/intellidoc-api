import { AppError } from "../middleware/errorHandler";
import Chat from "../models/Chat";
import Document from "../models/Document";
import Chunk from "../models/Chunk";
import { createEmbedding } from "./embedding.service";
import { groqChat } from "./groq.service";

export const createChatService = async (
  userId: string,
  documentIds: string[],
  title: string
) => {
  const docs = await Document.find({
    _id: { $in: documentIds },
    userId,
    status: "ready",
  });

  if (docs.length !== documentIds.length) {
    throw new AppError(404, "Document not found");
  }

  const chat = await Chat.create({
    userId,
    documentIds,
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

  if (!chat.documentIds || chat.documentIds.length === 0) {
    throw new AppError(400, "No documents attached to this chat");
  }

  // Create embedding from user message
  const userEmbedding = await createEmbedding(userMessage);

  const similarChunks = await findSimilarChunks(
    chat.documentIds.map((id) => id.toString()),
    userEmbedding,
    5
  );

  // Build context for LLM
  const context = similarChunks.length
    ? similarChunks.map((chunk) => chunk.text).join("\n\n")
    : "No relevant context found in uploaded documents.";

  // Generate assistant response
  const assistantMessage = await groqChat(userMessage, context);

  // Save user message
  chat.messages.push({
    role: "user",
    content: userMessage,
    relatedChunks: similarChunks.map((chunk) => chunk._id),
  });

  // Save assistant message
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
  documentIds: string[],
  embedding: number[],
  limit: number
) => {
  if (!documentIds || documentIds.length === 0) {
    return [];
  }

  const chunks = await Chunk.find({
    documentId: { $in: documentIds },
  });

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