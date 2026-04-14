import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { uploadDocumentService } from "../services/document.service";
import { processDocument } from "../services/processDocument.service";

type UploadedFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
};

export const uploadDocument = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const request = req as AuthRequest & {
      file?: UploadedFile;
    };

    if (!request.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!request.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const document = await uploadDocumentService(
      request.userId,
      request.file
    );

    res.status(201).json(document);
    processDocument(document._id.toString()).catch(console.error);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to upload document",
    });
  }
};