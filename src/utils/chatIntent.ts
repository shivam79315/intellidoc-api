import Groq from "groq-sdk";
import { env } from "../config/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export type AIIntent =
  | "casual"
  | "document"
  | "general";

export const detectChatIntent =
  async (
    message: string,
    history: string[],
    docNames: string[]
  ): Promise<AIIntent> => {
    const prompt = `
Classify the user's latest message into one category:

1. casual
2. document
3. general

Rules:
- If asking about uploaded files/resume/pdf/docx/content/summary/explain => document
- If mentions document names => document
- Greetings/thanks => casual
- Everything else => general

Documents:
${docNames.join("\n")}

History:
${history.join("\n")}

Latest message:
${message}

Reply ONLY one word:
casual
document
general
`;

    const res =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 5,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    return (
      res.choices[0]
        ?.message?.content
        ?.trim()
        .toLowerCase() as AIIntent
    );
  };