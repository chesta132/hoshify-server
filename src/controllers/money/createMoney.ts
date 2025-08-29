import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Money } from "@/models/Money";

export const createMoney = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const money = await Money.create({ userId: user.id });

    res.body({ success: money }).notif("Money management created").respond();
  } catch (err) {
    if ((err as any)?.code === 11000) {
      res.tempClientType("money management is already created").respond();
      return;
    }
    handleError(err, res);
  }
};
