import { NextFunction, Request, Response } from "express";
import { validateRequires } from "@/utils/validate";
import { pick } from "@/utils/manipulate/object";
import { CreateConfig, ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";
import { ellipsis } from "@/utils/manipulate/string";

export const createOneFactory = <
  M extends Exclude<Model, Model<"user">>,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { neededField, acceptableField }: CreateConfig<M, NF, AF>,
  { query, funcBeforeRes, funcInitiator, transformData }: ControllerOptions<InferByModel<M>, ArgsOf<M["create"]>, NF, AF, "transformData"> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      if (neededField) validateRequires(neededField as string[], req.body);
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      let data = { ...pick(req.body, [...(neededField || []), ...(acceptableField || [])]), userId: user.id } as any;
      if (transformData) data = transformData(data, req, res);

      const createdData = await (model.create as Function)({ ...query, data });

      if (funcBeforeRes) await funcBeforeRes(createdData, req, res);
      res
        .body({ success: createdData })
        .info(`${ellipsis(createdData.title || model.modelName, 30)} added`)
        .created();
    } catch (err) {
      next(err);
    }
  };
};
