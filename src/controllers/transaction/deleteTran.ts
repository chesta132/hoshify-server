import { Request, Response } from "express";
import { softDeleteOne } from "../templates/softDeleteOne";
import { Transaction } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";

export const deleteTran = async (req: Request, { res }: Response) => {
  await softDeleteOne(Transaction, req, res, async (data) => {
    await updateMoney({ ...data, reverse: true });
  });
};
