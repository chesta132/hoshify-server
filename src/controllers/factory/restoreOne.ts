import { ellipsis } from "@/utils/manipulate/string";
import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";

export const restoreOneFactory = <
  M extends Model<"note" | "transaction" | "todo" | "schedule">,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>, ArgsOf<M["create"]>, NF, AF>
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const data = (await model.restore({
        ...query,
        where: { id, userId: req.user!.id, isRecycled: true, ...(query as any)?.where },
      })) as any;

      if (funcBeforeRes) await funcBeforeRes(data, req, res);

      res
        .body({ success: { ...data, isRecycled: false, deleteAt: null } })
        .info(`${ellipsis(data.title, 30)} restored`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
