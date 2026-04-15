import mongoose from "mongoose";
import DocumentModel, {
  IDocument,
} from "../models/Document";

export const createDocument = async (
  data: Partial<IDocument>
) => {
  return await DocumentModel.create(data);
};

export const findDocumentsByUserId = async (
  userId: string
) => {
  return await DocumentModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({ createdAt: -1 });
};

export const findDocumentByIdAndUserId = async (
  userId: string,
  documentId: string
) => {
  return await DocumentModel.findOne({
    _id: new mongoose.Types.ObjectId(documentId),
    userId: new mongoose.Types.ObjectId(userId),
  });
};

export const deleteDocumentByIdAndUserId = async (
  userId: string,
  documentId: string
) => {
  return await DocumentModel.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(documentId),
    userId: new mongoose.Types.ObjectId(userId),
  });
};