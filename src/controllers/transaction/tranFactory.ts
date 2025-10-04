import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreOneFactory } from "../factory/restoreOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { NormalizeCurrecyData, normalizeCurrency } from "@/utils/manipulate/normalize";
import { Request } from "express";
import { Transaction, transactionType, TTransaction } from "@/services/db/Transaction";
import { Money } from "@/services/db/Money";
import { createOneFactory } from "../factory/createOne";
import { AppError } from "@/services/error/AppError";

const isLowerThanZero = (data: any) => {
  const { amount, type } = data;
  if (amount < 0) {
    data.type = type === "INCOME" ? "OUTCOME" : "INCOME";
    data.amount = Math.abs(amount);
  }
};

const amountToCurrency = (data: TTransaction, req: Request) => {
  const normalized = normalizeCurrency(data as NormalizeCurrecyData, req.user!.currency as string);
  data.amount = normalized.amount;
};

export const createTrans = createManyFactory(
  Transaction,
  { neededField: ["type", "title", "amount"], acceptableField: ["details"] },
  {
    funcInitiator(req) {
      const body = req.body as any[];
      if (!body.every((body) => transactionType.includes(body.type))) {
        throw new AppError("CLIENT_FIELD", { field: "type", message: `invalid type enum, please select between ${transactionType.join(" or ")}` });
      }
      body.forEach((data) => {
        const { amount, type } = data;
        if (amount !== 0 && type) isLowerThanZero(data);
      });
    },
    async funcBeforeRes(data, req) {
      await Money.updateMoneyMany(data, data[0].userId.toString());
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
  query: { where: { isRecycled: false } },
});

export const getTran = getOneFactory(Transaction, {
  funcBeforeRes(data, req) {
    amountToCurrency(data, req);
  },
});

export const restoreTran = restoreOneFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await Money.updateMoney(data);
    amountToCurrency(data, req);
  },
});

export const restoreTrans = restoreManyFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await Money.updateMoneyMany(data, data[0].userId.toString());
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const deleteTran = softDeleteOneFactory(Transaction, {
  async funcBeforeRes(data, req) {
    await Money.updateMoney({ ...data, reverse: true });
    amountToCurrency(data, req);
  },
});

export const deleteTrans = softDeleteManyFactory(Transaction, {
  async funcBeforeRes(data, req) {
    if (data[0]) await Money.updateMoneyMany(data, data[0].userId.toString(), true);
    data.forEach((data) => {
      amountToCurrency(data, req);
    });
  },
});

export const createTran = createOneFactory(
  Transaction,
  { neededField: ["type", "title", "amount"], acceptableField: ["details"] },
  {
    funcInitiator(req) {
      const { type, amount } = req.body;
      if (!transactionType.includes(type)) {
        throw new AppError("CLIENT_FIELD", { field: "type", message: `invalid type enum, please select between ${transactionType.join(" or ")}` });
      }
      if (amount !== 0 && type) isLowerThanZero(req.body);
    },
    async funcBeforeRes(data, req) {
      await Money.updateMoney(data);
      amountToCurrency(data, req);
    },
  }
);
