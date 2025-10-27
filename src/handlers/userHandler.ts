import User from "../models/User";

export async function getAllUsers() {
  return await User.find().lean();
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email }).lean();
}
