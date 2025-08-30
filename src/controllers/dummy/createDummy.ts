import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { oneWeeks } from "@/utils/token";
import { NODE_ENV } from "@/app";
import { Model } from "mongoose";
import { todoStatus as enumTodoStatus } from "@/models/Todo";
import { transactionType as enumTranType } from "@/models/Transaction";
import pluralize from "pluralize";
import { capitalEach, formatDate } from "@/utils/manipulate";

export const createDummy = async <T extends { dummy: boolean }>(model: Model<T>, req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { length } = req.query;
    const { transactionType, todoStatus } = req.body;
    if (NODE_ENV !== "development") {
      res.body({ error: { code: "SERVER_ERROR", message: "ENV is not in development" } }).respond();
      return;
    }
    const name = model.getName();

    const dummys = await model.generateDummy(parseInt(length?.toString() || "0") || 0, {
      userId: { fixed: user.id },
      title: { dynamicString: `Dummy ${capitalEach(name)}` },
      details: { fixed: `Dummy created At ${formatDate(new Date(), { includeHour: true })}` },
      start: { dynamicDate: { end: new Date(Date.now() + oneWeeks * 2) } },
      dueDate: { dynamicDate: { end: new Date(Date.now() + oneWeeks * 2) } },
      type: transactionType ? { fixed: transactionType } : { enum: enumTranType },
      status: todoStatus ? { fixed: todoStatus } : { enum: enumTodoStatus },
    });
    console.warn(`${dummys?.length} created by ${user.fullName}:\n`, dummys);

    res
      .body({ success: dummys })
      .notif(`${length} ${name} ${pluralize("dummy", dummys?.length)} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
