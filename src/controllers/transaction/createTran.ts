import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Transaction, transactionType } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";
import { ellipsis } from "@/utils/manipulate";

export const createTran = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    let { title, details, type, amount } = req.body;
    if (!title || !type || !amount) {
      res.tempMissingFields("title, type, amount").respond();
      return;
    }
    if (!transactionType.includes(type)) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return;
    }
    if (amount < 0) {
      type = type === "INCOME" ? "OUTCOME" : "INCOME";
      amount = Math.abs(amount);
    }

    const tran = await Transaction.create({
      userId: user.id,
      title,
      details,
      type,
      amount,
    });
    await updateMoney(tran);
    res
      .body({ success: tran })
      .notif(`${ellipsis(tran.title, 30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
