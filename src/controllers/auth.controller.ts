import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);

    // set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    })

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  res.json({ message: 'Logged out successfully' })
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await getCurrentUser(req.userId);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
