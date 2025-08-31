import { ObjectId, Schema, model } from "mongoose";
import { schemaOptions } from "./User";
import { virtualSchema } from "@/utils/database/plugin";

export interface ILink {
  _id: ObjectId;
  link: string;
  title: string;
  position: number;
  userId: ObjectId | string;
}

const LinkSchema = new Schema(
  {
    link: { type: String, required: true },
    title: { type: String, required: true, maxLength: 50 },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  schemaOptions
);

virtualSchema(LinkSchema);

export const Link = model<ILink>("Link", LinkSchema);
