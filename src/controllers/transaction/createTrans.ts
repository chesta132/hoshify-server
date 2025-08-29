import { Transaction, transactionType } from "@/models/Transaction";
import { updateMoneyMany } from "@/models/Money";
import { createMany } from "../templates/createMany";

export const createTrans = () => {
  return createMany(
    Transaction,
    ["type", "title", "amount"],
    (bodys, req, res) => {
      if (!bodys.every((body) => transactionType.includes(body.type))) {
        res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      }
    },
    (data) => {
      const { amount, type } = data;
      if (amount < 0) {
        data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
        data.amount = Math.abs(amount);
      }
    },
    async (data) => {
      await updateMoneyMany(data, data[0].userId.toString());
    }
  );
};
