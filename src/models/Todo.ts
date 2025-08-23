import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

const TodoStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELED"] as const;

export interface ITodo {
  _id: ObjectId;
  title: string;
  details: string;
  status: (typeof TodoStatus)[number];
  dueDate?: Date;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt?: Date;
  dummy: boolean;
}

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, enum: TodoStatus, default: "PENDING" },
    dueDate: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

virtualSchema(TodoSchema);

const TodoRaw = model<ITodo>("Todo", TodoSchema);

export const Todo = new Database(TodoRaw);
