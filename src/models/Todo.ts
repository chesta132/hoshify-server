import { ObjectId, Schema, model } from "mongoose";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin } from "@/class/newDB";

const TodoStatus = ["PENDING", "ACTIVE", "COMPLETED", "CANCELED"] as const;

export interface ITodo {
  _id: ObjectId;
  title: string;
  details: string;
  status: (typeof TodoStatus)[number];
  dueDate: Date;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt?: Date;
  dummy: boolean;
}

const TodoSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 150 },
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

TodoSchema.plugin(softDeletePlugin);
TodoSchema.plugin(dummyPlugin);

virtualSchema(TodoSchema);

export const Todo = model<ITodo>("Todo", TodoSchema);
