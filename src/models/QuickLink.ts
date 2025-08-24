import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

export interface IQuickLink {
  _id: ObjectId;
  link: string;
  title: string;
  position: number;
  userId: ObjectId | string;
  dummy: boolean;
}

const QuickLinkSchema = new Schema(
  {
    link: { type: String, required: true },
    title: { type: String, required: true, maxLength: 50 },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

virtualSchema(QuickLinkSchema);

const QuickLinkRaw = model<IQuickLink>("QuickLink", QuickLinkSchema);

export const QuickLink = new Database(QuickLinkRaw);
