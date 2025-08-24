import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

export interface ILink {
  _id: ObjectId;
  link: string;
  title: string;
  position: number;
  userId: ObjectId | string;
  dummy: boolean;
}

const LinkSchema = new Schema(
  {
    link: { type: String, required: true },
    title: { type: String, required: true, maxLength: 50 },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

virtualSchema(LinkSchema);

const LinkRaw = model<ILink>("Link", LinkSchema);

export const Link = new Database(LinkRaw);
