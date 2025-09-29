import { ITransaction, Transaction, transactionType } from "@/models/Transaction";
import { updateMoney, updateMoneyMany } from "@/models/Money";
import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreOneFactory } from "../factory/restoreOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { createOneFactory } from "../factory/createOne";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { Normalized } from "@/types";
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

export const createTrans = createManyFactory(
  Transaction,
  { neededField: ["type", "title", "amount"], acceptableField: ["details"] },
  {
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
  }
);

export const getTrans = getManyFactory(Transaction, {
  funcBeforeRes(data, req) {
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const getTran = getOneFactory(Transaction, {
  funcBeforeRes(data, req) {
    amountToCurrency(data, req);
  },
});

export const restoreTran = restoreOneFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoney(data);
    amountToCurrency(data, req);
  },
});

export const restoreTrans = restoreManyFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoneyMany(data, data[0].userId.toString());
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const deleteTran = softDeleteOneFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await updateMoney({ ...data, reverse: true });
    amountToCurrency(data, req);
  },
});

export const deleteTrans = softDeleteManyFactory(Transaction, {
  async funcBeforeRes(data, req) {
    if (data[0]) await updateMoneyMany(data, data[0].userId.toString(), true);
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const createTran = createOneFactory(
  Transaction,
  { neededField: ["type", "title", "amount"], acceptableField: ["details"] },
  {
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
  }
);
