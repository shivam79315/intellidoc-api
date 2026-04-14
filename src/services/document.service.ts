import mongoose from "mongoose";
import { createDocument } from "../repositories/document.repository";

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