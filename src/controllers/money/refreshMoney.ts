import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Money } from "@/models/Money";

const refreshConfig = ["income", "outcome", "total"] as const;
type RefreshConfig = (typeof refreshConfig)[number];

export const refreshMoney = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { refresh }: { refresh?: RefreshConfig } = req.query;
    if (!refresh || !refreshConfig.includes(refresh)) {
      res.tempClientField("refreshMoney", 'invalid refresh type, please select between "income", "outcome" or "total"').respond();
      return;
    }

    const oldMoney = await Money.findOne({ userId: user.id }).normalize();
    if (!oldMoney) {
      res.tempNotFound("money").respond();
      return;
    }

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

    const newMoney = await Money.findByIdAndUpdate(oldMoney.id, { [toUpdate[0]]: toUpdate[1] }, { new: true, runValidators: true }).normalize();

    res.body({ success: newMoney }).notif("money management refreshed").respond();
  } catch (err) {
    handleError(err, res);
  }
};
