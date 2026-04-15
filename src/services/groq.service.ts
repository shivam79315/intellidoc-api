import Groq from "groq-sdk";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

export const groqChat = async (
  userMessage: string,
  context: string
): Promise<string> => {
  try {
    const systemPrompt = `
You are a helpful document assistant.
Answer only using the provided document context.

If answer is not found, say:
"I couldn't find this information in the document."

Document Context:
${context}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const assistantMessage =
      response.choices[0]?.message?.content ||
      "I couldn't generate a response.";

    return assistantMessage;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new AppError(500, "Failed to get response from AI");
  }
};