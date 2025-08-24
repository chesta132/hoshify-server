import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

const TransactionType = ["INCOME", "OUTCOME"] as const;

export interface ITransaction {
  _id: ObjectId;
  amount: number;
  type: (typeof TransactionType)[number];
  title: string;
  details: string;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt?: Date;
  dummy: boolean;
}

const TransactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: TransactionType, required: true },
    title: { type: String, required: true, maxLength: 150 },
    details: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

virtualSchema(TransactionSchema);

const TransactionRaw = model<ITransaction>("Transaction", TransactionSchema);

export const Transaction = new Database(TransactionRaw);
