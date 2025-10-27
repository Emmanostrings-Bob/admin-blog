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
    _id: false, 
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
