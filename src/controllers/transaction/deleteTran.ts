import { softDeleteOne } from "../templates/softDeleteOne";
import { Transaction } from "@/models/Transaction";
import { updateMoney } from "@/models/Money";

export const deleteTran = () => {
  return softDeleteOne(Transaction, async (data) => {
    await updateMoney({ ...data, reverse: true });
  });
};
