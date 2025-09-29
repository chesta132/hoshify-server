import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ellipsis } from "@/utils/manipulate/string";
import { Model } from "mongoose";
import { ControllerConfig, ControllerOptions } from "@/types";
import { validateRequires } from "@/utils/validate";
import { create } from "@/services/crud/create";
import { pick } from "@/utils/manipulate/object";

export const createOneFactory = <T, F extends keyof T>(
  model: Model<T>,
  { neededField, acceptableField }: ControllerConfig<T, F>,
  options?: Omit<ControllerOptions<T>, "filter" | "settings">
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      if (neededField) validateRequires(neededField as string[], req.body);
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const datas = { ...pick(req.body, [...(neededField || []), ...(acceptableField || [])]), userId: user.id } as T;

      const createdData = await create(model, datas);

      if (options?.funcBeforeRes) await options.funcBeforeRes(createdData, req, res);
      res
        .body({ success: createdData })
        .info(`${ellipsis((createdData as any).title || model.getName(), 30)} added`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
