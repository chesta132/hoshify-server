import { softDeleteOne } from "../templates/softDeleteOne";
import { Transaction } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { softDeleteMany } from "../templates/softDeleteMany";

export const deleteTran = () => {
  return softDeleteOne(Transaction, async (data) => {
    await updateMoney({ ...data, reverse: true });
  });
};

export const deleteTrans = () => {
  return softDeleteMany(Transaction, async (data) => {
    await updateMoneyMany(data, data[0].userId.toString(), true);
  });
};
