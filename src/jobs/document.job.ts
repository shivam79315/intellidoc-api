// src/jobs/document.job.ts
import { documentQueue } from "../queues/document.queue";

export const addProcessDocumentJob =
  async (documentId: string) => {
    return await documentQueue.add(
      "process-document",
      { documentId }
    );
  };

export const addBulkProcessJobs =
  async (documentIds: string[]) => {
    return await documentQueue.addBulk(
      documentIds.map((documentId) => ({
        name: "process-document",
        data: { documentId },
      }))
    );
  };