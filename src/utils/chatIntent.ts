// src/utils/chatIntent.ts

export type ChatIntent =
  | "casual"
  | "document"
  | "general";

export const detectChatIntent = (
  message: string
): ChatIntent => {
  const text =
    message.trim().toLowerCase();

  const casualInputs = [
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "cool",
    "nice",
    "bye",
  ];

  if (
    casualInputs.includes(text)
  ) {
    return "casual";
  }

  const docKeywords = [
    "document",
    "doc",
    "pdf",
    "file",
    "page",
    "summarize",
    "summary",
    "uploaded",
    "what is in",
    "explain",
    "section",
    "content",
    "chat summary",
  ];

  if (
    docKeywords.some((word) =>
      text.includes(word)
    )
  ) {
    return "document";
  }

  return "general";
};

export const getQuickReply = (
    message: string
  ): string => {
    const text =
      message.trim().toLowerCase();
  
    if (
      /(thank|thanks|thx)/.test(
        text
      )
    ) {
      return "You're welcome.";
    }
  
    if (
      /(hi|hello|hey)/.test(
        text
      )
    ) {
      return "Hello. How can I help with your document?";
    }
  
    if (
      /(bye|goodbye|see ya)/.test(
        text
      )
    ) {
      return "Goodbye.";
    }
  
    if (
      /(anything else|more|what else)/.test(
        text
      )
    ) {
      return "I can summarize the document, explain sections, extract key points, or answer more questions.";
    }
  
    if (
      /(ok|okay|alright|got it|sure|cool|nice)/.test(
        text
      )
    ) {
      return "Sure. What would you like next?";
    }
  
    return "How can I help?";
};

export const getGeneralReply =
  (): string => {
    return "I'm designed to help with your uploaded documents. Please ask about your current file or upload another document.";
  };