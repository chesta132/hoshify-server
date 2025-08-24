import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Transaction, transactionType } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";

export const createTran = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details, type, amount } = req.body;
    if (!title || !type || !amount) {
      res.tempMissingFields("title, type, amount").respond();
      return;
    }
    if (!transactionType.includes(type)) {
      res.tempClientType("type").respond();
      return;
    }

    const tran = await Transaction.createAndNormalize({
      userId: user.id,
      title,
      details,
      type,
      amount,
    });
    await updateMoney(tran);
    res
      .body({ success: tran })
      .notif(`${tran.title.ellipsis(10)} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
