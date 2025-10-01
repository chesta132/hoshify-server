import { Model, ModelDummyable } from "@/services/db/types";
import { NextFunction, Request, Response } from "express";
import pluralize from "pluralize";

export const deleteDummy = <M extends Model<ModelDummyable>>(model: M) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { length } = req.query;
      const dummys = await model.deleteDummy(user.id.toString(), Number(length) || "all");
      const name = model.modelName;

      res
        .body({ success: dummys })
        .info(`${dummys.count} ${name} ${pluralize("dummy", dummys.count)} deleted`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
