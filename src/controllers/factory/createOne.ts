import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ellipsis } from "@/utils/manipulate/string";
import { Model } from "mongoose";
import { ControllerTemplateOptions } from "@/types/types";
import { validateRequires } from "@/utils/validate";

export const createOne = <T>(model: Model<T>, neededField: string[], options?: ControllerTemplateOptions<T>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      if (!validateRequires(neededField, req.body, res)) return;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const data = (await model.create({ ...req.body, userId: user.id })).normalize();

      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);
      res
        .body({ success: data })
        .info(`${ellipsis((data as any).title || model.getName(), 30)} added`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
