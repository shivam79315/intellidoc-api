import { Request, Response } from "express";
import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.service";

type Params = {
  id: string;
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsersService();
    console.log(users)
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (
  req: Request<Params>,
  res: Response
) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const updateUser = async (
  req: Request<Params>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const user = await updateUserService(
      req.params.id,
      email,
      password
    );

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (
  req: Request<Params>,
  res: Response
) => {
  try {
    await deleteUserService(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};