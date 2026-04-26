import logger from "../config/logger";

export const logError = (
  error: Error | any,
  context: {
    requestId?: string;
    userId?: string;
    chatId?: string;
    operation?: string;
    [key: string]: any;
  }
) => {
  logger.error(error.message || "Unknown error", {
    ...context,
    errorCode: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
  });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: any) => {
  logger.warn(message, context);
};