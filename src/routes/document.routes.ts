import { Router } from "express";
import { uploadDocument } from "../controllers/document.controller";
import { authMiddleware } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.use(authMiddleware);

router.post(
  "/upload",
  upload.single("file"),
  uploadDocument
);

export default router;