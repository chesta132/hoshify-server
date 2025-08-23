import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

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
    title: { type: String, required: true },
    details: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

virtualSchema(NoteSchema);

const NoteRaw = model<INote>("Note", NoteSchema);

export const Note = new Database(NoteRaw);
