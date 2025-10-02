import { Money } from "@/services/db/Money";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { Request, Response, NextFunction } from "express";

export const getMoney = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const money = await Money.findFirst({ where: { userId: user.id.toString() } });
    const normalized = normalizeCurrency(money, user.currency.toString());
    res.body({ success: normalized }).respond();
  } catch (err) {
    next(err);
  }
};
