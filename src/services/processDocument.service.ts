import Document from "../models/Document";
import Chunk from "../models/Chunk";
import { redisConnection } from "../config/redis";
import { extractTextFromFile } from "../utils/extractor";
import { chunkText } from "../utils/chunker";
import { createEmbeddingBatch } from "./embedding.service";
import { logInfo, logError } from "../utils/errorLogger";
import { env } from "../config/env";

const BATCH_SIZE = env.BATCH_SIZE; // Insert 100 chunks at a time
const EMBEDDING_BATCH_SIZE = env.EMBEDDING_BATCH_SIZE; // Create 10 embeddings in parallel

export const processDocument = async (documentId: string) => {
  logInfo("processDocument started", { documentId });

  try {
    // Step 1: Mark processing
    logInfo("Step 1: Marking document as processing", { documentId });
    await Document.findByIdAndUpdate(documentId, {
      status: "processing",
      errorMessage: "",
    });
    logInfo("Step 1 completed", { documentId });

    // Step 2: Find document
    logInfo("Step 2: Finding document record", { documentId });
    const doc = await Document.findById(documentId);

    if (!doc) {
      throw new Error("Document not found");
    }
    logInfo("Step 2 completed", { documentId, path: doc.path });

    // Step 3: Extract text
    logInfo("Step 3: Extracting text from file", { documentId });
    const rawText = await extractTextFromFile(doc.path);
    logInfo("Step 3 completed", {
      documentId,
      extractedLength: rawText.length,
    });

    // Step 4: Save extracted text
    logInfo("Step 4: Saving extracted text to database", { documentId });
    await Document.findByIdAndUpdate(documentId, {
      extractedText: rawText,
    });
    logInfo("Step 4 completed", { documentId });

    // Step 5: Chunk text
    logInfo("Step 5: Chunking text", { documentId });
    const chunks = chunkText(rawText, 500);
    logInfo("Step 5 completed", {
      documentId,
      chunkCount: chunks.length,
    });

    // Step 6: Remove old chunks
    logInfo("Step 6: Removing old chunks", { documentId });
    await Chunk.deleteMany({ documentId: doc._id });
    logInfo("Step 6 completed", { documentId });

    // Step 7 & 8: Create embeddings + batch save
    logInfo("Step 7-8: Creating embeddings and saving in batches", {
      documentId,
      totalChunks: chunks.length,
      batchSize: BATCH_SIZE,
    });

    let processedChunks = 0;
    const startTime = Date.now();

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(
        i,
        Math.min(i + BATCH_SIZE, chunks.length)
      );

      logInfo("Processing batch", {
        documentId,
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batchChunks.length,
        totalProcessed: processedChunks,
      });

      const records: any[] = [];

      // Process embeddings in parallel (10 at a time)
      for (let j = 0; j < batchChunks.length; j += EMBEDDING_BATCH_SIZE) {
        const embeddingBatch = batchChunks.slice(
          j,
          Math.min(j + EMBEDDING_BATCH_SIZE, batchChunks.length)
        );

        const texts = embeddingBatch.map((chunk) => chunk.text);
        const embeddings = await createEmbeddingBatch(texts);

        embeddingBatch.forEach((chunk, idx) => {
          records.push({
            documentId: doc._id,
            userId: doc.userId,
            text: chunk.text,
            index: chunk.index,
            wordCount: chunk.wordCount,
            embedding: embeddings[idx],
          });
        });

        logInfo("Embedding sub-batch completed", {
          documentId,
          subBatchSize: embeddingBatch.length,
        });
      }

      // Batch insert to database
      if (records.length > 0) {
        try {
          await Chunk.insertMany(records, { ordered: false });
          processedChunks += records.length;

          logInfo("Batch inserted successfully", {
            documentId,
            insertedCount: records.length,
            totalProcessed: processedChunks,
          });
        } catch (insertError) {
          logError(insertError, {
            operation: "batchInsert",
            documentId,
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
          });
          throw insertError;
        }
      }
    }

    const duration = Date.now() - startTime;
    logInfo("Step 7-8 completed: All embeddings created and saved", {
      documentId,
      totalProcessed: processedChunks,
      duration,
      avgTimePerChunk: (duration / processedChunks).toFixed(2) + "ms",
    });

    // Step 9: Clear extracted text from database
    logInfo("Step 9: Clearing extracted text", { documentId });
    await Document.findByIdAndUpdate(documentId, {
      extractedText: null,
    });
    logInfo("Step 9 completed: Extracted text cleared", { documentId });

    // Step 10: Clear Redis temporary data
    logInfo("Step 10: Clearing Redis data", { documentId });
    await redisConnection.del(`doc:${documentId}:temp`);
    logInfo("Step 10 completed: Redis cleared", { documentId });

    // Step 11: Mark document ready
    logInfo("Step 11: Marking document as ready", { documentId });
    await Document.findByIdAndUpdate(documentId, {
      status: "ready",
      processedChunks: processedChunks,
    });
    logInfo("Step 11 completed: Document ready", { documentId, totalChunks: processedChunks });
  } catch (error) {
    logError(error, { operation: "processDocument", documentId });

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Processing failed",
      extractedText: null,
    });

    await redisConnection.del(`doc:${documentId}:temp`);
    throw error;
  }
};