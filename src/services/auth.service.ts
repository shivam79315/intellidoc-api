import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository";

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user._id },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  return user;
};
