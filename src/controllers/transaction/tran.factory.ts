import { Transaction, transactionType } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { createMany } from "../templates/createMany";
import { editMany } from "../templates/editMany";
import { getMany } from "../templates/getMany";
import { getOne } from "../templates/getOne";
import { restoreOne } from "../templates/restoreOne";
import { restoreMany } from "../templates/restoreMany";
import { softDeleteOne } from "../templates/softDeleteOne";
import { softDeleteMany } from "../templates/softDeleteMany";

export const createTrans = createMany(Transaction, ["type", "title", "amount"], {
  funcInitiator(req, res) {
    const body = req.body as any[];
    if (!body.every((body) => transactionType.includes(body.type))) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
    }
    body.forEach((data) => {
      const { amount, type } = data;
      if (amount < 0) {
        data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
        data.amount = Math.abs(amount);
      }
    });
  },
  async funcBeforeRes(data) {
    await updateMoneyMany(data, data[0].userId.toString());
  },
});

export const editTrans = editMany(Transaction, [], {
  funcInitiator(req) {
    (req.body as any[]).forEach((data) => {
      const { amount, type } = data;
      if (!amount || !type) return;
      if (amount < 0) {
        data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
        data.amount = Math.abs(amount);
      }
    });
  },
  async funcBeforeRes(datas, req) {
    const body = req.body as any[];
    const normalizedBody = datas.map((data) => ({ ...data, ...body.find((d) => d.id === data.id || d._id === data.id) }));
    await updateMoneyMany(normalizedBody, req.user!.id);
  },
});

export const getTrans = getMany(Transaction);

export const getTran = getOne(Transaction);

export const restoreTran = restoreOne(Transaction, {
  async funcBeforeRes(data) {
    await updateMoney(data);
  },
});

export const restoreTrans = restoreMany(Transaction, {
  async funcBeforeRes(data) {
    await updateMoneyMany(data, data[0].userId.toString());
  },
});

export const deleteTran = softDeleteOne(Transaction, {
  async funcBeforeRes(data) {
    await updateMoney({ ...data, reverse: true });
  },
});

export const deleteTrans = softDeleteMany(Transaction, {
  async funcBeforeRes(data) {
    await updateMoneyMany(data, data[0].userId.toString(), true);
  },
});
