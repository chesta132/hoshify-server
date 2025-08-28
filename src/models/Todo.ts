import { ObjectId, Schema, model } from "mongoose";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin } from "@/utils/database";

export const todoStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELED"];
export type TodoStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELED";

export interface ITodo {
  _id: ObjectId;
  title: string;
  details: string;
  status: TodoStatus;
  dueDate: Date;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt: Date | null;
  dummy?: boolean;
}

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true, default: "" },
    status: { type: String, enum: todoStatus, default: "PENDING" },
    dueDate: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
    dummy: Boolean,
  },
  schemaOptions
);

TodoSchema.plugin(softDeletePlugin);
TodoSchema.plugin(dummyPlugin);

virtualSchema(TodoSchema);

export const Todo = model<ITodo>("Todo", TodoSchema);
