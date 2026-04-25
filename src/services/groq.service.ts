// src/services/groq.service.ts

import Groq from "groq-sdk";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export const groqChat = async (
  userMessage: string,
  context: string,
  history: HistoryMessage[] = [],
  docNames: string[] = []
): Promise<string> => {
  try {
    const uploadedDocs =
      docNames.length > 0
        ? docNames.join(", ")
        : "No uploaded document";

    const systemPrompt = `
You are a smart document assistant.

Rules:
1. First check if user mentions any uploaded document name.
2. If user names a document, prioritize that document.
3. Use previous chat history.
4. Use provided document context.
5. Prioritize document facts over assumptions.
6. Be concise and helpful.
7. If answer is not present in context, clearly say so.

Uploaded Documents:
${uploadedDocs}

If no readable document content exists, reply:
"I found your uploaded document, but I couldn't read its contents. It may be password protected, scanned image only, corrupted, or unsupported."

If answer is not found in document, reply:
"I couldn't find this information in the document."

Document Context:
${context}
`;

    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),

      {
        role: "user",
        content: userMessage,
      },
    ];

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 1024,
        messages,
      });

    return (
      response.choices[0]
        ?.message?.content ||
      "I couldn't generate a response."
    );
  } catch (error) {
    console.error(
      "Groq API Error:",
      error
    );

    throw new AppError(
      500,
      "Failed to get response from AI"
    );
  }
};