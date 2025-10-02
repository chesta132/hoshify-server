import { Money } from "@/services/db/Money";
import { AppError } from "@/services/error/AppError";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const createMoney = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const money = normalizeCurrency(await Money.create({ data: { userId: user.id.toString() } }), user.currency.toString());

    res.body({ success: money }).info("Money management created").respond();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      next(new AppError("SERVER_ERROR", { message: "Money management is already created," }));
    }
    next(err);
  }
};
