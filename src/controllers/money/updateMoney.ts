import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Money } from "@/models/Money";

export const updateMoney = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { income, outcome } = req.body;
    const parsedIncome = parseInt(income);
    const parsedOutcome = parseInt(outcome);
    if (parsedIncome !== 0 && !parsedIncome) {
      res.tempClientType("Invalid income type. Income must be in number type");
      return;
    } else if (parsedOutcome !== 0 && !parsedOutcome) {
      res.tempClientType("Invalid outcome type. Outcome must be in number type");
      return;
    }

    const total = income - outcome;

    const money = Money.findOneAndUpdate({ _id: id, userId: user.id }, { income, outcome, total }).normalizeCurrency(user.currency);

    res.body({ success: money }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
