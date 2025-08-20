import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

const TodoStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELED"] as const;

export interface ITodo extends Document {
  title: string;
  details?: string;
  status: (typeof TodoStatus)[number];
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    details: String,
    status: { type: String, enum: TodoStatus, default: "PENDING" },
    dueDate: Date,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const TodoRaw = model<ITodo>("Todo", TodoSchema);

export const Todo = new Database(TodoRaw)
