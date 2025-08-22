import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualId } from "../utils/manipulate";
import { SchemaOptions } from "./User";

const TransactionType = ["INCOME", "OUTCOME"] as const;

export interface ITransaction {
  _id: ObjectId;
  amount: number;
  type: (typeof TransactionType)[number];
  title?: string;
  details?: string;
  date: Date;
  userId: ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const TransactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: TransactionType, required: true },
    title: String,
    details: String,
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  SchemaOptions
);

virtualId(TransactionSchema);

const TransactionRaw = model<ITransaction>("Transaction", TransactionSchema);

export const Transaction = new Database(TransactionRaw);
