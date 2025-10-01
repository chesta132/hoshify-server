import { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "@/config";
import { AppError } from "@/services/error/Error";
import { Model } from "@/services/db/types";

export const createDummy = <M extends Model, T extends { dummy: boolean }>(model: M) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { length } = req.query;
      if (NODE_ENV !== "development") throw new AppError("FORBIDDEN", { message: "ENV is not in development" });

      // WIP
      // const dummys = await model.generateDummy(parseInt(length?.toString() || "0"), {
      //   userId: { fixed: user.id },
      //   title: { dynamicString: `Dummy ${capitalEach(name)}` },
      //   details: { fixed: `Dummy created At ${formatDate(new Date(), { includeHour: true })}` },
      //   start: { dynamicDate: { end: new Date(Date.now() + timeInMs({ week: 2 })) } },
      //   dueDate: { dynamicDate: { end: new Date(Date.now() + timeInMs({ week: 2 })) } },
      //   type: transactionType ? { fixed: transactionType } : { enum: enumTranType },
      //   status: todoStatus ? { fixed: todoStatus } : { enum: enumTodoStatus },
      // });
      // console.warn(`${dummys?.length} created by ${user.fullName}:\n`, dummys);

      throw new AppError("FORBIDDEN", { message: "Controller WIP" });
    } catch (err) {
      next(err);
    }
  };
};
