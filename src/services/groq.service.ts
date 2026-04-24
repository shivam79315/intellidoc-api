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
  history: HistoryMessage[] = []
): Promise<string> => {
  try {
    const systemPrompt = `
You are a helpful document assistant.

Rules:
1. Use previous conversation context.
2. Use provided document context.
3. Prioritize document facts.
4. Be concise and helpful.

If answer is not found, say:
"I couldn't find this information in the document."

Document Context:
${context}
`;

    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...history.map(
        (msg) => ({
          role: msg.role,
          content:
            msg.content,
        })
      ),

      {
        role: "user",
        content: userMessage,
      },
    ];

    const response =
      await groq.chat.completions.create(
        {
          model:
            "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1024,
          messages,
        }
      );

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