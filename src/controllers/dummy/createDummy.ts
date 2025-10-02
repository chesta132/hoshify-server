import { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "@/config";
import { AppError } from "@/services/error/AppError";
import { Model, ModelDummyable } from "@/services/db/types";
import pluralize from "pluralize";

export const createDummy = <M extends Model<ModelDummyable>>(model: M) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { length } = req.query;
      if (NODE_ENV !== "development") throw new AppError("FORBIDDEN", { message: "ENV is not in development" });

      const dummys = await model.createDummy(user.id.toString(), { length: Number(length?.toString()) || undefined, seed: req.body });
      console.warn(`${dummys?.length} created by ${user.fullName}:\n`, dummys);

      res
        .body({ success: dummys })
        .info(`${length} ${model.modelName} ${pluralize("dummy", dummys?.length)} added`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
