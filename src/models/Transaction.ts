import { ObjectId, Schema, model } from "mongoose";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin } from "@/class/newDB";

export const transactionType = ["INCOME", "OUTCOME"] as const;

export interface ITransaction {
  _id: ObjectId;
  amount: number;
  type: (typeof transactionType)[number];
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
    type: { type: String, enum: transactionType, required: true },
    title: { type: String, required: true, maxLength: 150 },
    details: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

TransactionSchema.plugin(softDeletePlugin);
TransactionSchema.plugin(dummyPlugin);

virtualSchema(TransactionSchema);

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
