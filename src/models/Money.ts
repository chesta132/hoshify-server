import { ObjectId, Schema, model } from "mongoose";
import { schemaOptions } from "./User";
import { ITransaction } from "./Transaction";
import { virtualSchema } from "@/utils/database/plugin";

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

export const Money = model<IMoney>("Money", MoneySchema);

export const getTotal = ({ type, amount }: { type: ITransaction["type"]; amount: number }) => {
  return type === "INCOME" ? amount : -amount;
};

export const incremByAmount = (transaction: Pick<ITransaction, "type" | "amount">, reverse?: boolean) => {
  let { type, amount } = transaction;
  if (reverse) amount = -amount;
  return { [type.toLowerCase()]: amount, total: getTotal({ ...transaction, amount }) };
};

export type UpdateMoneyProps = Pick<ITransaction, "userId" | "type" | "amount"> & { reverse?: boolean };
export const updateMoney = async ({ userId, type, amount, reverse }: UpdateMoneyProps) => {
  await Money.updateOne({ userId }, { $inc: incremByAmount({ type, amount }, reverse) });
};

export const updateMoneyMany = async (transactions: Omit<UpdateMoneyProps, "reverse">[], userId: string, reverse?: boolean) => {
  const toUpdate = { total: 0, income: 0, outcome: 0 };

  transactions
    .filter((data) => data.type === "INCOME")
    .forEach((data) => {
      if (reverse) {
        toUpdate.income -= data.amount;
        toUpdate.total -= data.amount;
      } else {
        toUpdate.income += data.amount;
        toUpdate.total += data.amount;
      }
    });

  transactions
    .filter((data) => data.type === "OUTCOME")
    .forEach((data) => {
      if (reverse) {
        toUpdate.outcome -= data.amount;
        toUpdate.total += data.amount;
      } else {
        toUpdate.outcome += data.amount;
        toUpdate.total -= data.amount;
      }
    });

  await Money.updateOne({ userId }, { $inc: toUpdate });
};
