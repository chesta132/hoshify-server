import { ObjectId, Schema, model } from "mongoose";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin, virtualSchema } from "@/utils/database/plugin";

export interface INote {
  _id: ObjectId;
  title: string;
  details: string;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt: Date | null;
  dummy?: boolean;
}

const NoteSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
    dummy: Boolean,
  },
  schemaOptions
);

NoteSchema.plugin(softDeletePlugin);
NoteSchema.plugin(dummyPlugin);

virtualSchema(NoteSchema);

export const Note = model<INote>("Note", NoteSchema);
