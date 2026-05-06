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

export const createEmbeddingBatch = async (texts: string[]): Promise<number[][]> => {
  try {
    const model = await loadModel();
    const results = await model(texts, { pooling: "mean", normalize: true });
    
    // results.data is a flat Float32Array, need to split per embedding
    const embeddingSize = 384;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const start = i * embeddingSize;
      const end = start + embeddingSize;
      embeddings.push(Array.from(results.data.slice(start, end)));
    }

    return embeddings;
  } catch (error) {
    console.error("Batch embedding failed:", error);
    throw new Error("Embedding service failed");
  }
}