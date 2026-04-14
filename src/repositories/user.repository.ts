import User, { IUser } from "../models/User";

export const createUser = async (data: Partial<IUser>) => {
  return await User.create(data);
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserById = async (id: string) => {
  return await User.findById(id).select("-password");
};

export const findAllUsers = async () => {
  return await User.find().select("-password");
};

export const updateUserById = async (
  id: string,
  data: Partial<IUser>
) => {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password");
};

export const deleteUserById = async (id: string) => {
  return await User.findByIdAndDelete(id);
};