import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { Model } from "mongoose";
import { ControllerConfig, ControllerOptions } from "@/types";
import { validateRequires } from "@/utils/validate";
import { create } from "@/services/crud/create";
import { pick } from "@/utils/manipulate/object";

export const createManyFactory = <T, F extends Partial<keyof T>>(
  model: Model<T>,
  { neededField, acceptableField }: ControllerConfig<T, F>,
  options?: Omit<ControllerOptions<T, []>, "filter" | "settings">
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const body: any[] = req.body;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      if (neededField) validateRequires(neededField as string[], req.body);

      const datas = body.map((b) => ({ ...pick(b, [...(neededField || []), ...(acceptableField || [])]), userId: user.id })) as T[];

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
