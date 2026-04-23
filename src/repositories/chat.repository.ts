// src/repositories/chat.repository.ts

import Chat from "../models/Chat";
import Document from "../models/Document";
import Chunk from "../models/Chunk";

export const createChat = async (data: {
  userId: string;
  documentIds: string[];
  title: string;
}) => {
  return await Chat.create({
    userId: data.userId,
    documentIds: data.documentIds,
    title: data.title,
    messages: [],
  });
};

export const findReadyDocumentsByIds = async (
  userId: string,
  documentIds: string[]
) => {
  return await Document.find({
    _id: { $in: documentIds },
    userId,
    status: "ready",
  });
};

export const findChatById = async (chatId: string) => {
  return await Chat.findById(chatId);
};

export const findChatsByUserId = async (userId: string) => {
  return await Chat.find({ userId })
    .select("title createdAt documentIds")
    .sort({ createdAt: -1 });
};

export const findChatByIdWithChunks = async (chatId: string) => {
  return await Chat.findById(chatId).populate(
    "messages.relatedChunks"
  );
};

export const deleteChatById = async (chatId: string) => {
  return await Chat.findByIdAndDelete(chatId);
};

export const findChunksByDocumentIds = async (
  documentIds: string[]
) => {
  return await Chunk.find({
    documentId: { $in: documentIds },
  });
};

export const saveChat = async (chat: any) => {
  return await chat.save();
};

export const createChatDocument =
  async (data: {
    userId: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    path: string;
  }) => {
    return await Document.create({
      userId: data.userId,
      originalName:
        data.originalName,
      fileName:
        data.fileName,
      mimeType:
        data.mimeType,
      size: data.size,
      path: data.path,
      status: "pending",
    });
  };

export const addDocumentToChat =
  async (
    chatId: string,
    documentId: string
  ) => {
    return await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: {
          documentIds:
            documentId,
        },
      },
      { new: true }
    );
};