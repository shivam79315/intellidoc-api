// src/services/document.service.ts

import mongoose from "mongoose";
import {
  createDocument,
  findDocumentsByUserId,
  findDocumentByIdAndUserId,
  deleteDocumentByIdAndUserId,
} from "../repositories/document.repository";

type UploadedFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
};

export const uploadDocumentService = async (
  userId: string,
  file: UploadedFile
) => {
  const document = await createDocument({
    userId: new mongoose.Types.ObjectId(userId),
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    status: "pending",
  });

  return document;
};

export const getDocumentsService = async (
  userId: string
) => {
  return await findDocumentsByUserId(userId);
};

export const getDocumentService = async (
  userId: string,
  documentId: string
) => {
  const document = await findDocumentByIdAndUserId(
    userId,
    documentId
  );

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
};

export const deleteDocumentService = async (
  userId: string,
  documentId: string
) => {
  const document = await deleteDocumentByIdAndUserId(
    userId,
    documentId
  );

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
};