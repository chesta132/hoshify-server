import { ObjectId, Schema, model } from "mongoose";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin } from "@/class/newDB";

export interface INote {
  _id: ObjectId;
  title: string;
  details: string;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt?: Date;
  dummy: boolean;
}

const NoteSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 150 },
    details: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

NoteSchema.plugin(softDeletePlugin);
NoteSchema.plugin(dummyPlugin);

virtualSchema(NoteSchema);

export const Note = model<INote>("Note", NoteSchema);
