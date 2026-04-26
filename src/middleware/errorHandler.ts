import multer from "multer";
import logger from "../config/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: any,
  res: any,
  next: any
) => {
  const requestId = req.context?.requestId || "unknown";

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      logger.warn("File size limit exceeded", { requestId });
      return res.status(413).json({
        status: "error",
        statusCode: 413,
        message:
          "Please upload a file up to 30MB",
      });
    }

    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: err.message,
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    logger.warn("AppError thrown", {
      requestId,
      statusCode: err.statusCode,
      message: err.message,
    });
    return res.status(
      err.statusCode
    ).json({
      status: "error",
      statusCode:
        err.statusCode,
      message: err.message,
    });
  }

  // Unknown error
  logger.error("Unhandled error", {
    requestId,
    error: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    statusCode: 500,
    message:
      "Internal Server Error",
  });
};

export const asyncHandler = (
  fn: Function
) => {
  return (
    req: any,
    res: any,
    next: any
  ) => {
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);
  };
};