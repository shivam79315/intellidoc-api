import { Router } from "express";
import { 
  uploadDocument, 
  getDocuments,
  getDocument,
  deleteDocument
} from "../controllers/document.controller";
import { authMiddleware } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.use(authMiddleware);

router.post(
  "/upload",
  upload.single("file"),
  uploadDocument
);

// get all documents for the authenticated user
router.get(
  "/",
  getDocuments
);

// GET /api/documents/:documentId
router.get(
  "/:documentId",
  getDocument
);

// DELETE /api/documents/:documentId
router.delete(
  "/:documentId",
  deleteDocument
);

export default router;