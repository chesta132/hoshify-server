import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { InternalArgs } from "@prisma/client/runtime/library";
import { ArgsOf, InferByDelegate } from "@/services/db/types";
import { TTransaction } from "./Transaction";

export type UpdateMoneyProps = Pick<TTransaction, "userId" | "type" | "amount"> & { reverse?: boolean };

export class MoneyService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.MoneyDelegate<ExtArgs, ClientOptions>, "money"> {
  constructor(model: Prisma.MoneyDelegate<ExtArgs, ClientOptions>) {
    super(model, "money");
  }

  getTotal = ({ type, amount }: { type: TTransaction["type"]; amount: number }) => {
    return type === "INCOME" ? amount : -amount;
  };

  incremByAmount = (transaction: Pick<TTransaction, "type" | "amount">, reverse?: boolean): ArgsOf<MoneyService<any, any>["update"]>["data"] => {
    let { type, amount } = transaction;
    if (reverse) amount = -amount;
    return {
      [type.toString().toLowerCase()]: { increment: amount },
      total: { increment: this.getTotal({ ...transaction, amount: Number(amount) }) },
    };
  };

  updateMoney = async ({ userId, type, amount, reverse }: UpdateMoneyProps) => {
    await Money.update({ where: { userId: userId.toString() }, data: this.incremByAmount({ type, amount }, reverse) });
  };

  updateMoneyMany = async (transactions: Omit<UpdateMoneyProps, "reverse">[], userId: string, reverse?: boolean) => {
    const update = { total: 0, income: 0, outcome: 0 };

    transactions
      .filter((data) => data.type === "INCOME")
      .forEach((data) => {
        if (reverse) {
          update.income -= Number(data.amount);
          update.total -= Number(data.amount);
        } else {
          update.income += Number(data.amount);
          update.total += Number(data.amount);
        }
      });

    transactions
      .filter((data) => data.type === "OUTCOME")
      .forEach((data) => {
        if (reverse) {
          update.outcome -= Number(data.amount);
          update.total += Number(data.amount);
        } else {
          update.outcome += Number(data.amount);
          update.total -= Number(data.amount);
        }
      });
    const toUpdate = { total: { increment: update.total }, income: { increment: update.income }, outcome: { increment: update.outcome } };

    await Money.update({ where: { userId: userId.toString() }, data: toUpdate });
  };
}

export const Money = new MoneyService(prisma.money);
export type ModelMoney = typeof Money;
export type TMoney = InferByDelegate<typeof prisma.money>;
