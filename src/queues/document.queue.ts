// src/queues/document.queue.ts
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export type DocumentJobData = {
  documentId: string;
};

export const DOCUMENT_QUEUE_NAME = "document-processing";

export const documentQueue =
  new Queue<DocumentJobData>(
    DOCUMENT_QUEUE_NAME,
    {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    }
  );