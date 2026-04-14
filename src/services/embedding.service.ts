import { pipeline } from "@xenova/transformers";

let extractor: any = null;

const loadModel = async () => {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
};

export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = await loadModel();
    const embedding = await model(text, { pooling: "mean", normalize: true });
    return Array.from(embedding.data) as number[];
  } catch (error) {
    console.error("Embedding failed:", error);
    throw new Error("Embedding service failed");
  }
};