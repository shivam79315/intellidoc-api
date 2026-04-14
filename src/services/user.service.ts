import bcrypt from "bcryptjs";
import {
  findAllUsers,
  findUserById,
  updateUserById,
  deleteUserById,
} from "../repositories/user.repository";

export const getUsersService = async () => {
  return await findAllUsers();
};

export const getUserByIdService = async (id: string) => {
  const user = await findUserById(id);
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserService = async (
  id: string,
  email?: string,
  password?: string
) => {
  const updateData: any = {};

  if (email) updateData.email = email;

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await updateUserById(id, updateData);
  if (!user) throw new Error("User not found");

  return user;
};

export const deleteUserService = async (id: string) => {
  const user = await deleteUserById(id);
  if (!user) throw new Error("User not found");

  return;
};