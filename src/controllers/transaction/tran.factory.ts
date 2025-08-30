import { ITransaction, Transaction, transactionType } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { createMany } from "../factory/createMany";
import { getMany } from "../factory/getMany";
import { getOne } from "../factory/getOne";
import { restoreOne } from "../factory/restoreOne";
import { restoreMany } from "../factory/restoreMany";
import { softDeleteOne } from "../factory/softDeleteOne";
import { softDeleteMany } from "../factory/softDeleteMany";
import { createOne } from "../factory/createOne";
import { normalizeCurrency } from "@/utils/normalizeQuery";
import { Normalized } from "@/types/types";
import { Request } from "express";

const isLowerThanZero = (data: any) => {
  const { amount, type } = data;
  if (amount < 0) {
    data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
    data.amount = Math.abs(amount);
  }
};

const amountToCurrency = (data: Normalized<ITransaction>, req: Request) => {
  const normalized = normalizeCurrency(data, req.user!.currency);
  data.amount = normalized.amount as any;
};

export const createTrans = createMany(Transaction, ["type", "title", "amount"], {
  funcInitiator(req, res) {
    const body = req.body as any[];
    if (!body.every((body) => transactionType.includes(body.type))) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return "stop";
    }
    body.forEach((data) => {
      const { amount, type } = data;
      if (amount !== 0 && type) isLowerThanZero(data);
    });
  },
  async funcBeforeRes(data, req) {
    await updateMoneyMany(data, data[0].userId.toString());
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const getTrans = getMany(Transaction, {
  funcBeforeRes(data, req) {
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const getTran = getOne(Transaction, {
  funcBeforeRes(data, req) {
    amountToCurrency(data, req);
  },
});

export const restoreTran = restoreOne(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoney(data);
    amountToCurrency(data, req);
  },
});

export const restoreTrans = restoreMany(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoneyMany(data, data[0].userId.toString());
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const deleteTran = softDeleteOne(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoney({ ...data, reverse: true });
    amountToCurrency(data, req);
  },
});

export const deleteTrans = softDeleteMany(Transaction, {
  async funcBeforeRes(data, req) {
    if (data[0]) await updateMoneyMany(data, data[0].userId.toString(), true);
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const createTran = createOne(Transaction, ["title", "type", "amount"], {
  funcInitiator(req, res) {
    const { type, amount } = req.body;
    if (!transactionType.includes(type)) {
      res.tempClientField("type", `invalid type enum, please select between ${transactionType.join(" or ")}`).respond();
      return "stop";
    }
    if (amount !== 0 && type) isLowerThanZero(req.body);
  },
  async funcBeforeRes(data, req) {
    await updateMoney(data);
    amountToCurrency(data, req);
  },
});
