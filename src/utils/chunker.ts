export interface TextChunk {
  index: number;
  text: string;
  wordCount: number;
}

export const chunkText = (text: string, wordsPerChunk = 500): TextChunk[] => {
  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  const chunks: TextChunk[] = [];

  for (let start = 0; start < words.length; start += wordsPerChunk) {
    const chunkWords = words.slice(start, start + wordsPerChunk);
    chunks.push({
      index: chunks.length,
      text: chunkWords.join(" "),
      wordCount: chunkWords.length,
    });
  }

  return chunks;
};
