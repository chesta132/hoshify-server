import { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

export interface IUser extends Document {
  fullName: string;
  email?: string;
  password?: string;
  gmail?: string;
  googleId?: string;
  verified: boolean;
  timeToAllowSendEmail: Date;
  createdAt: Date;
}

export const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email"],
      index: 1,
    },
    password: {
      type: String,
      minlength: 6,
    },
    gmail: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid gmail"],
      index: 1,
    },
    googleId: String,
    verified: { type: Boolean, default: false },
    timeToAllowSendEmail: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.virtual("todos", {
  ref: "Todo",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("money", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("schedules", {
  ref: "Schedule",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("links", {
  ref: "QuickLink",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("widgets", {
  ref: "WidgetConfig",
  localField: "_id",
  foreignField: "userId",
});

const UserRaw = model<IUser>("User", UserSchema);

export const User = new Database(UserRaw);
