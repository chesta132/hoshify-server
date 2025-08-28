import { restoreOne } from "../templates/restoreOne";
import { Transaction } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";

export const restoreTran = () => {
  return restoreOne(Transaction, async (data) => {
    await updateMoney(data);
  });
};
