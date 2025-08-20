import mongoose, { Schema, model, Document, InferSchemaType } from "mongoose";
import { Database } from "../class/Database";

export interface INote extends Document {
  title: string;
  details?: string;
  userId: mongoose.Types.ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    details: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const NoteRaw = model<INote>("Note", NoteSchema);

export const Note = new Database(NoteRaw);
