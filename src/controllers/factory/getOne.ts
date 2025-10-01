import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";

export const getOneFactory = <
  M extends Model,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>, ArgsOf<M["findFirst"]>, NF, AF> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const data = (await model.findFirst({
        ...query,
        where: { id, ...(query as any).where },
      })) as any;

      if (funcBeforeRes) await funcBeforeRes(data, req, res);

      res.body({ success: data }).respond();
    } catch (err) {
      next(err);
    }
  };
};
