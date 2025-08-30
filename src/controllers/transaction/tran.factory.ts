import { Transaction, transactionType } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { createMany } from "../factory/createMany";
import { editMany } from "../factory/editMany";
import { getMany } from "../factory/getMany";
import { getOne } from "../factory/getOne";
import { restoreOne } from "../factory/restoreOne";
import { restoreMany } from "../factory/restoreMany";
import { softDeleteOne } from "../factory/softDeleteOne";
import { softDeleteMany } from "../factory/softDeleteMany";
import { createOne } from "../factory/createOne";

const isLowerThanZero = (data: any) => {
  const { amount, type } = data;
  if (amount < 0) {
    data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
    data.amount = Math.abs(amount);
  }
};

export const createTrans = createMany(Transaction, ["type", "title", "amount"], {
  funcInitiator(req, res) {
    const body = req.body as any[];
    if (!body.every((body) => transactionType.includes(body.type))) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return "stop";
    }
    body.forEach((data) => {
      isLowerThanZero(data);
    });
  },
  async funcBeforeRes(data) {
    await updateMoneyMany(data, data[0].userId.toString());
  },
});

export const editTrans = editMany(Transaction, [], {
  funcInitiator(req) {
    (req.body as any[]).forEach((data) => {
      isLowerThanZero(data);
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

export const createTran = createOne(Transaction, ["title", "type", "amount"], {
  funcInitiator(req, res) {
    const { type } = req.body;
    if (!transactionType.includes(type)) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return "stop";
    }
    isLowerThanZero(req.body);
  },
  async funcBeforeRes(data) {
    await updateMoney(data);
  },
});
