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