import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualId } from "../utils/manipulate";
import { SchemaOptions } from "./User";

export interface INote {
  _id: ObjectId;
  title: string;
  details?: string;
  userId: ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const NoteSchema = new Schema(
  {
    title: { type: String, required: true },
    details: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  SchemaOptions
);

virtualId(NoteSchema);

const NoteRaw = model<INote>("Note", NoteSchema);

export const Note = new Database(NoteRaw);
