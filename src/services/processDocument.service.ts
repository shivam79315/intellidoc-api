import Document from "../models/Document";
import Chunk from "../models/Chunk";
import { extractTextFromFile } from "../utils/extractor";
import { chunkText } from "../utils/chunker";
import { createEmbedding } from "./embedding.service";

export const processDocument = async (documentId: string) => {
  try {
    // Mark processing
    await Document.findByIdAndUpdate(documentId, {
      status: "processing",
      errorMessage: "",
    });

    const doc = await Document.findById(documentId);

    if (!doc) {
      throw new Error("Document not found");
    }

    // 1. Extract text
    const rawText = await extractTextFromFile(doc.path);
    console.log(`Extracted text length: ${rawText.length}`);

    // 2. Save extracted text
    await Document.findByIdAndUpdate(documentId, {
      extractedText: rawText,
    });

    console.log('Processing to chunks...');
    // 3. Chunk text
    const chunks = chunkText(rawText, 500);

    // Remove old chunks if reprocessing
    await Chunk.deleteMany({
      documentId: doc._id,
    });
    console.log('Processing to embeddings...');
    // 4. Create embeddings + prepare records
    const records = [];

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.text);

      records.push({
        documentId: doc._id,
        userId: doc.userId,
        text: chunk.text,
        index: chunk.index,
        wordCount: chunk.wordCount,
        embedding,
      });
    }
    console.log('Saving chunks...');
    // 5. Save chunks
    if (records.length > 0) {
      await Chunk.insertMany(records);
    }
    console.log('Finished saving chunks. Total chunks:', records.length);
    // 6. Mark ready
    await Document.findByIdAndUpdate(documentId, {
      status: "ready",
    });

  } catch (error: any) {
    console.error("processDocument error:", error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
      errorMessage: error?.message || "Processing failed",
    });
  }
};