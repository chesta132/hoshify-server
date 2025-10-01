import { NextFunction, Request, Response } from "express";
import { ControllerConfig, ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";
import { validateRequires } from "@/utils/validate";
import { omit, pick } from "@/utils/manipulate/object";
import { unEditableField } from "@/services/db/Base";

export const updateOneFactory = <
  M extends Model,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { neededField, acceptableField }: ControllerConfig<M, NF, AF>,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>, ArgsOf<M["update"]>, NF, AF> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (neededField) validateRequires(neededField as string[], req.body);
      req.body = pick(omit(req.body, unEditableField) as any, [...(neededField || []), ...(acceptableField || [])]);

      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const data = await (model.update as Function)({ ...query, where: { id, userId: req.user!.id, ...query?.where } });

      if (funcBeforeRes) await funcBeforeRes(data, req, res);

      res
        .body({ success: data })
        .info(`${(data as any).title || model.modelName}`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
