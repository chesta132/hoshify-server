import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ellipsis } from "@/utils/manipulate/string";
import { Model } from "mongoose";
import { ControllerOptions, Normalized } from "@/types/types";
import { validateRequires } from "@/utils/validate";
import { create } from "@/services/crud/create";

export const createOneFactory = <T>(model: Model<T>, neededField: string[], options?: ControllerOptions<T>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      if (!validateRequires(neededField, req.body, res)) return;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const createdData = (await create(model, { ...req.body, userId: user.id })) as Normalized<T>;

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
