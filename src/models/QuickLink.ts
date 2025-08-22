import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualId } from "../utils/manipulate";
import { SchemaOptions } from "./User";

export interface IQuickLink {
  _id: ObjectId;
  link: string;
  title: string;
  position: number;
  userId: ObjectId;
}

const QuickLinkSchema = new Schema(
  {
    link: { type: String, required: true },
    title: { type: String, required: true },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  SchemaOptions
);

virtualId(QuickLinkSchema);

const QuickLinkRaw = model<IQuickLink>("QuickLink", QuickLinkSchema);

export const QuickLink = new Database(QuickLinkRaw);
