// src/services/groq.service.ts

import Groq from "groq-sdk";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";
import logger from "../config/logger";
import { logError, logInfo } from "../utils/errorLogger";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const buildSystemPrompt = (docNames: string[], context: string): string => {
  logInfo("Step 1: Building system prompt", {
    docCount: docNames.length,
    contextLength: context.length,
  });

  try {
    const uploadedDocs =
      docNames.length > 0
        ? docNames.join(", ")
        : "No uploaded document";

    const systemPrompt = `
You are a strict document-only assistant.

MISSION:
Answer ONLY from the provided document context.

NON-NEGOTIABLE RULES:
1. Use only the Document Context below.
2. Never use outside/world knowledge.
3. Never answer from memory.
4. Never invent missing facts.
5. If the answer is not explicitly present in the context, reply exactly:

"I couldn't find this information in the document."

6. If the user's question is unrelated to the document, reply exactly:

"Please ask a question related to the uploaded document."

7. If the user asks for suggestions, provide ONLY questions relevant to the uploaded document content.
8. If multiple documents exist, prioritize any file name mentioned by user.
9. Keep answers concise and factual.

Uploaded Documents:
${uploadedDocs}

Document Context:
${context}
`;

    logInfo("Step 1 completed: System prompt built", {
      promptLength: systemPrompt.length,
    });
    return systemPrompt;
  } catch (error) {
    logError(error, { operation: "buildSystemPrompt" });
    throw error;
  }
};

const buildMessageArray = (
  userMessage: string,
  systemPrompt: string,
  history: HistoryMessage[]
): any[] => {
  logInfo("Step 2: Building message array", {
    userMessageLength: userMessage.length,
    historyLength: history.length,
  });

  try {
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

    logInfo("Step 2 completed: Message array built", {
      totalMessages: messages.length,
    });
    return messages;
  } catch (error) {
    logError(error, { operation: "buildMessageArray" });
    throw error;
  }
};

const callGroqAPI = async (messages: any[]): Promise<string> => {
  logInfo("Step 3: Calling Groq API", {
    messageCount: messages.length,
    model: "llama-3.3-70b-versatile",
  });

  try {
    const startTime = Date.now();

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
      messages,
    });

    const duration = Date.now() - startTime;

    logInfo("Step 3 completed: Groq API response received", {
      duration,
      finishReason: response.choices[0]?.finish_reason,
      responseLength: response.choices[0]?.message?.content?.length,
    });

    return (
      response.choices[0]?.message?.content ||
      "I couldn't generate a response."
    );
  } catch (error) {
    logError(error, {
      operation: "callGroqAPI",
      messageCount: messages.length,
    });
    throw new AppError(500, "Failed to get response from AI");
  }
};

export const groqChat = async (
  userMessage: string,
  context: string,
  history: HistoryMessage[] = [],
  docNames: string[] = [],
  requestId?: string
): Promise<string> => {
  logInfo("groqChat service started", {
    requestId,
    userMessageLength: userMessage.length,
    contextLength: context.length,
    docCount: docNames.length,
    historyLength: history.length,
  });

  try {
    // Step 1: Build system prompt
    const systemPrompt = buildSystemPrompt(docNames, context);

    // Step 2: Build message array
    const messages = buildMessageArray(userMessage, systemPrompt, history);

    // Step 3: Call Groq API
    const response = await callGroqAPI(messages);

    logInfo("groqChat service completed successfully", {
      requestId,
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    logError(error, {
      requestId,
      operation: "groqChat",
      userMessageLength: userMessage.length,
      contextLength: context.length,
      docCount: docNames.length,
    });

    throw error;
  }
};