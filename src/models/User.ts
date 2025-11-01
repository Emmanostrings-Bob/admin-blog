import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../types";

export interface IUser extends Document {
  _id: string;
  email: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export default mongoose.model<IUser>("User", userSchema, "user");
