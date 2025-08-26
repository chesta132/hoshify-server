import { Request, Response } from "express";
import { restoreOne } from "../templates/restoreOne";
import { Transaction } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";

export const restoreTran = async (req: Request, { res }: Response) => {
  await restoreOne(Transaction, req, res, async (data) => {
    await updateMoney(data);
  });
};
