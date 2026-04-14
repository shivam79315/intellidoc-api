import DocumentModel, { IDocument } from "../models/Document";

export const createDocument = async (
  data: Partial<IDocument>
) => {
  return await DocumentModel.create(data);
};