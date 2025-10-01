import { Money } from "@/services/db/Money";
import { AppError } from "@/services/error/Error";
import { NextFunction, Request, Response } from "express";

const refreshConfig = ["income", "outcome", "total"] as const;
type RefreshConfig = (typeof refreshConfig)[number];

export const refreshMoney = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { refresh }: { refresh?: RefreshConfig } = req.query;
    if (!refresh || !refreshConfig.includes(refresh)) {
      throw new AppError("CLIENT_FIELD", {
        field: "refreshMoney",
        message: 'invalid refresh type, please select between "income", "outcome" or "total"',
      });
    }

    const oldMoney = await Money.findFirst({ where: { id, userId: user.id.toString() } });

    const { total, outcome, income } = oldMoney;
    let toUpdate = ["income", total - outcome] as [RefreshConfig, number];
    switch (refresh) {
      case "income":
        toUpdate = ["income", total + outcome];
        break;
      case "outcome":
        toUpdate = ["outcome", income - total];
        break;
      case "total":
        toUpdate = ["total", income - outcome];
        break;
    }

    const newMoney = await Money.updateById(oldMoney.id, { data: { [toUpdate[0]]: toUpdate[1] } });

    res.body({ success: newMoney }).info("money management refreshed").respond();
  } catch (err) {
    next(err);
  }
};
