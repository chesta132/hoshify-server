import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Database } from "@/class/Database";
import { oneWeeks } from "@/utils/token";
import { NODE_ENV } from "@/app";

export const createDummy = async <T extends { dummy: boolean }>(model: Database<T>, name: string, req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { length } = req.query;
    const { transactionType, todoStatus } = req.body;
    if (NODE_ENV !== "development") {
      res.body({ error: { code: "SERVER_ERROR", message: "ENV is not in development" } }).respond();
      return;
    }

    const dummys = await model.generateDummy(parseInt(length?.toString() || "0") || 0, {
      userId: { fixed: user.id },
      title: { dynamicString: `Dummy ${name.capitalEach()}` },
      details: { fixed: new Date().toFormattedString({ includeHour: true }) },
      date: { fixed: new Date() },
      start: { fixed: new Date() },
      dueDate: { fixed: new Date(Date.now() + oneWeeks) },
      type: { fixed: transactionType || "INCOME" },
      status: { fixed: todoStatus },
    } as any);
    console.warn(`${dummys?.length} created by ${user.fullName}:\n`, dummys);

    res
      .body({ success: dummys })
      .notif(`${length} ${name} ${dummys?.plural("dummy")} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
