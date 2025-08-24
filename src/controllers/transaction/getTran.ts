import { Request, Response } from "express";
import { getOne } from "../templates/getOne";
import { Transaction } from "@/models/Transaction";

export const getTran = async (req: Request, { res }: Response) => {
  await getOne(Transaction, req, res);
};
