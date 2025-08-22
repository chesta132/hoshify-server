import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualId } from "../utils/manipulate";
import { SchemaOptions } from "./User";

const TodoStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELED"] as const;

export interface ITodo {
  _id: ObjectId;
  title: string;
  details?: string;
  status: (typeof TodoStatus)[number];
  dueDate?: Date;
  userId: ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    details: String,
    status: { type: String, enum: TodoStatus, default: "PENDING" },
    dueDate: Date,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  SchemaOptions
);

virtualId(TodoSchema);

const TodoRaw = model<ITodo>("Todo", TodoSchema);

export const Todo = new Database(TodoRaw);
