import { Worker, Job } from "bullmq";
import connectDB from "../config/db";
import { redisConnection } from "../config/redis";
import {
  DOCUMENT_QUEUE_NAME,
  DocumentJobData,
} from "../queues/document.queue";
import { processDocument } from "../services/processDocument.service";

const startWorker = async () => {
  await connectDB();

  console.log("Worker MongoDB connected");

  const worker =
    new Worker<DocumentJobData>(
      DOCUMENT_QUEUE_NAME,
      async (
        job: Job<DocumentJobData>
      ) => {
        const { documentId } =
          job.data;

        console.log(
          `Starting job ${job.id} for ${documentId}`
        );

        await processDocument(
          documentId
        );

        console.log(
          `Finished job ${job.id}`
        );
      },
      {
        connection:
          redisConnection,
        concurrency: 2,
      }
    );

  worker.on(
    "completed",
    (job) => {
      console.log(
        `Job ${job.id} completed`
      );
    }
  );

  worker.on(
    "failed",
    (job, error) => {
      console.error(
        `Job ${job?.id} failed:`,
        error.message
      );
    }
  );

  worker.on(
    "error",
    (error) => {
      console.error(
        "Worker error:",
        error
      );
    }
  );

  console.log(
    "Document worker started..."
  );
};

startWorker();