import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { ITransaction } from "./Transaction";

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

export const incremByAmount = (transaction: Pick<ITransaction, "type" | "amount">, reverse?: boolean) => {
  let { type, amount } = transaction;
  if (reverse) amount = -amount;
  return type === "INCOME" ? { income: amount, total: amount } : { outcome: amount, total: -amount };
};

export const updateMoney = async ({ userId, type, amount, reverse }: Pick<ITransaction, "userId" | "type" | "amount"> & { reverse?: boolean }) => {
  await Money.updateOne({ userId }, { $inc: incremByAmount({ type, amount }, reverse) });
};

export const Money = new Database(MoneyRaw);
