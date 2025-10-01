import { Money } from "@/services/db/Money";
import { AppError } from "@/services/error/Error";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { NextFunction, Request, Response } from "express";

export const updateMoney = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { income, outcome } = req.body;
    const parsedIncome = parseInt(income);
    const parsedOutcome = parseInt(outcome);
    if (parsedIncome !== 0 && !parsedIncome) {
      throw new AppError("CLIENT_TYPE", { fields: "Income", details: "Invalid income type. Income must be in number type" });
    } else if (parsedOutcome !== 0 && !parsedOutcome) {
      throw new AppError("CLIENT_TYPE", { fields: "Outcome", details: "Invalid income type. Outcome must be in number type" });
    }

    const total = income - outcome;

    const money = normalizeCurrency(
      await Money.update({ where: { id, userId: user.id.toString() }, data: { income, outcome, total } }),
      user.currency.toString()
    );

    res.body({ success: money }).respond();
  } catch (err) {
    next(err);
  }
};
