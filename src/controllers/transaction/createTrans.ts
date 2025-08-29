import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Transaction } from "@/models/Transaction";
import pluralize from "pluralize";
import { ITransaction, transactionType } from "@/models/Transaction";

type BodyType = { datas: (Pick<ITransaction, "details" | "title" | "amount" | "type"> & { userId: string })[] };

export const createTrans = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { datas }: BodyType = req.body;
    for (const data of datas) {
      if (!transactionType.includes(data.type)) {
        res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
        return;
      }
    }

    datas.forEach((data) => {
      const { amount, type } = data;
      if (amount < 0) {
        data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
        data.amount = Math.abs(amount);
      }
      data.userId = user.id;
    });

    const todos = await Transaction.create(datas);
    res
      .body({ success: todos })
      .notif(`${todos.length} ${pluralize("todo", todos.length)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
