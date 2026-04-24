import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  uploadDocumentService,
  getDocumentsService,
  getDocumentService,
  deleteDocumentService,
} from "../services/document.service";

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
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to upload document",
    });
  }
};

export const getDocuments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const documents = await getDocumentsService(req.userId);

    res.status(200).json(documents);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch documents",
    });
  }
};

export const getDocument = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const request = req as AuthRequest & {
      params: {
        documentId: string;
      };
    };

    if (!request.userId) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const document = await getDocumentService(
      request.userId,
      request.params.documentId
    );

    res.status(200).json(document);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Document not found",
    });
  }
};

export const deleteDocument = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const request = req as AuthRequest & {
      params: {
        documentId: string;
      };
    };

    if (!request.userId) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await deleteDocumentService(
      request.userId,
      request.params.documentId
    );

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      message:
        error.message ||
        "Failed to delete document",
    });
  }
};