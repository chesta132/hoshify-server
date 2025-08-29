import { restoreOne } from "../templates/restoreOne";
import { Request } from "express";
import { Transaction } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { restoreMany } from "../templates/restoreMany";

export const restoreTran = () => {
  return restoreOne(Transaction, async (data) => {
    await updateMoney(data);
  });
};

export const restoreTrans = () => {
  return restoreMany(Transaction, async (data) => {
    await updateMoneyMany(data, data[0].userId.toString());
  });
};
