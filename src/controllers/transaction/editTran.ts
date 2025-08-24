import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Transaction, transactionType } from "@/models/Transaction";
import { isValidObjectId } from "mongoose";
import { updateMoney } from "@/models/Money";

export const editTran = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    let { title, details, type, amount } = req.body;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }
    if (!transactionType.includes(type)) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return;
    }

    const tran = await Transaction.updateByIdAndNormalize(
      id,
      {
        title,
        details,
        type,
        amount,
      },
      { options: { runValidators: true } }
    );
    if (!tran) {
      res.tempNotFound("transaction");
      return;
    }
    const { userId } = tran;

    if (tran.amount !== amount || tran.type !== type) {
      await updateMoney({ ...tran, reverse: true });
      await updateMoney({ userId, type, amount });
    }

    if (!title) title = tran.title;
    if (!details) details = tran.details;
    if (!type) type = tran.type;
    if (!amount) amount = tran.amount;

    res.body({ success: { ...tran, amount, type, details, title } }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
