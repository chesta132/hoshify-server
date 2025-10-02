import { NextFunction, Request, Response } from "express";
import { AppError } from "@/services/error/Error";
import { Transaction, transactionType } from "@/services/db/Transaction";
import { Money } from "@/services/db/Money";

export const updateTran = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    let { title, details, type, amount } = req.body;

    if (!transactionType.includes(type)) {
      throw new AppError("CLIENT_TYPE", { fields: "type", details: `invalid type enum, please select between ${transactionType.join(" or ")}` });
    }
    if (amount < 0) {
      type = type === "INCOME" ? "OUTCOME" : "INCOME";
      amount = Math.abs(amount);
    }

    const oldTran = await Transaction.findUnique({
      where: { id },
    });

    const tran = await Transaction.updateById(id, {
      data: {
        title,
        details,
        type,
        amount,
      },
    });

    if (oldTran.amount !== amount || oldTran.type !== type) {
      const oldTypeField = oldTran.type.toLowerCase();
      const newTypeField = type.toLowerCase();

      const updateData: { [x: string]: { decrement?: number; increment?: number }; total: { decrement?: number; increment?: number } } = {
        [oldTypeField]: { decrement: oldTran.amount },
        total: { decrement: Money.getTotal({ type: oldTran.type, amount: oldTran.amount }) },
      };

      updateData[newTypeField] = { increment: amount };
      updateData.total = { increment: Money.getTotal({ type, amount }) };

      await Money.update({
        where: { userId: user.id.toString() },
        data: updateData,
      });
    }

    res.body({ success: tran }).respond();
  } catch (err) {
    next(err);
  }
};
