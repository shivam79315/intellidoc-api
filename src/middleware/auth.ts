import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string,
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: "Not authorized" })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}