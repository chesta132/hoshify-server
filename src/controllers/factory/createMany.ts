import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { Model } from "mongoose";
import { ControllerOptions } from "@/types/types";
import { validateRequires } from "@/utils/validate";
import { create } from "@/services/crud/create";

export const createManyFactory = <T>(model: Model<T>, neededField: string[], options?: ControllerOptions<T, []>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const datas: any[] = req.body;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      if (!validateRequires(neededField, datas, res)) return;

      datas.forEach((data) => {
        data.userId = user.id;
      });

      const createdDatas = await create(model, datas);
      if (options?.funcBeforeRes) await options.funcBeforeRes(createdDatas, req, res);

      res
        .body({ success: createdDatas })
        .info(`${createdDatas.length} ${pluralize(model.getName(), createdDatas.length)} added`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
