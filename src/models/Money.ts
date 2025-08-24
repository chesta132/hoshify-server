import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

export interface IMoney {
  _id: ObjectId;
  userId: ObjectId | string;
  total: number;
  income: number;
  outcome: number;
}

const MoneySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    total: { type: Number, required: true, default: 0 },
    income: { type: Number, required: true, default: 0 },
    outcome: { type: Number, required: true, default: 0 },
  },
  schemaOptions
);

virtualSchema(MoneySchema);

const MoneyRaw = model<IMoney>("Money", MoneySchema);

export const Money = new Database(MoneyRaw);
