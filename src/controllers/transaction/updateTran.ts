import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Transaction, transactionType } from "@/models/Transaction";
import { isValidObjectId } from "mongoose";
import { getTotal, Money } from "@/models/Money";
import { AppError } from "@/class/Error";
import db from "@/services/crud";

export const updateTran = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    let { title, details, type, amount } = req.body;
    if (!isValidObjectId(id)) {
      throw new AppError("CLIENT_TYPE", { fields: "Object ID" });
    }
    if (!transactionType.includes(type)) {
      throw new AppError("CLIENT_TYPE", { fields: "type", details: `invalid type enum, please select between ${transactionType.join(" or ")}` });
    }
    if (amount < 0) {
      type = type === "INCOME" ? "OUTCOME" : "INCOME";
      amount = Math.abs(amount);
    }

    const tran = await db.updateById(
      Transaction,
      id,
      {
        title,
        details,
        type,
        amount,
      },
      { options: { runValidators: true } }
    );

    const { amount: tranAmount } = tran;
    const tranType = tran.type.toLowerCase() as "income" | "outcome";
    const typeField = type.toLowerCase() as "income" | "outcome";
    const dataToUpdate = { [tranType]: -tranAmount, total: -getTotal(tran) + getTotal({ type, amount }) };

    if (tran.amount !== amount || tran.type !== type) {
      dataToUpdate[typeField] = (-dataToUpdate[typeField] || 0) + amount;

      await Money.updateOne({ userId: user.id }, { $inc: dataToUpdate });
    }

    if (!title) title = tran.title;
    if (!details) details = tran.details;
    if (!type) type = tran.type;
    amount = amount ?? tran.amount;

    res.body({ success: { ...tran, amount, type, details, title } }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
