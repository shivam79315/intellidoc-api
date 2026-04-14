// errorHandler.ts
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

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const { statusCode = 500, message = "Internal Server Error" } = err;

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};