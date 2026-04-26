import { Worker, Job } from "bullmq";
import connectDB from "../config/db";
import { redisConnection } from "../config/redis";
import logger from "../config/logger";
import {
  DOCUMENT_QUEUE_NAME,
  DocumentJobData,
} from "../queues/document.queue";
import { processDocument } from "../services/processDocument.service";

const startWorker = async () => {
  try {
    await connectDB();
    logger.info("Worker MongoDB connected");

    const worker = new Worker<DocumentJobData>(
      DOCUMENT_QUEUE_NAME,
      async (job: Job<DocumentJobData>) => {
        const { documentId } = job.data;

        logger.info("Job started", {
          jobId: job.id,
          documentId,
          attempt: job.attemptsMade,
        });

        try {
          await processDocument(documentId);
          logger.info("Job completed", { jobId: job.id, documentId });
        } catch (error) {
          logger.error("Job processing error", {
            jobId: job.id,
            documentId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error; // Re-throw for BullMQ to handle retry
        }
      },
      {
        connection: redisConnection,
        concurrency: 1, // Changed from 2 to 1 (process one at a time)
        lockDuration: 600000, // Lock for 10 minutes
        lockRenewTime: 300000, // Renew lock every 5 minutes
        maxStalledCount: 2, // Allow 2 stalled attempts
        stalledInterval: 5000, // Check every 5 seconds
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      }
    );

    worker.on("completed", (job) => {
      logger.info("Job completed event", {
        jobId: job.id,
        documentId: job.data.documentId,
      });
    });

    worker.on("failed", (job, error) => {
      logger.error("Job failed event", {
        jobId: job?.id,
        documentId: job?.data?.documentId,
        error: error.message,
        attempt: job?.attemptsMade,
      });
    });

    worker.on("error", (error) => {
      logger.error("Worker error", {
        message: error.message,
        code: (error as any).code,
      });
    });

    worker.on("stalled", (jobId) => {
      logger.warn("Job stalled", { jobId });
    });

    worker.on("drained", () => {
      logger.info("Queue drained - all jobs processed");
    });

    logger.info("Document worker started", {
      concurrency: 1,
      lockDuration: "10 minutes",
      queue: DOCUMENT_QUEUE_NAME,
    });
  } catch (error) {
    logger.error("Worker startup failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down worker gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down worker gracefully");
  process.exit(0);
});

startWorker();