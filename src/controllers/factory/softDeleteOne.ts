import { ellipsis } from "@/utils/manipulate/string";
import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model, ModelSoftDeletable } from "@/services/db/types";

export const softDeleteOneFactory = <
  M extends Model<ModelSoftDeletable>,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>, ArgsOf<M["softDelete"]>, NF, AF> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const data = (await model.softDelete({ ...query, where: { id, userId: req.user!.id, isRecycled: false, ...(query as any).where } })) as any;

      if (funcBeforeRes) await funcBeforeRes(data, req, res);

      res
        .body({ success: data })
        .info(`${ellipsis(data.title, 30)} deleted`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
