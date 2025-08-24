import { Request, Response } from "express";
import { Transaction } from "@/models/Transaction";
import { getMany } from "../templates/getMany";

export const getTrans = async (req: Request, { res }: Response) => {
  await getMany(Transaction, req, res);
};
