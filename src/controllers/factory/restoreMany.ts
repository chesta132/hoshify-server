import pluralize from "pluralize";
import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";

export const restoreManyFactory = <
  M extends Model<"note" | "transaction" | "todo" | "schedule">,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>[], ArgsOf<M["create"]>, NF, AF>
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const ids: string[] = req.body;

      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const unUpdated = await model.findMany({ where: { id: { in: ids }, userId: req.user!.id as string } });

      await model.restore({
        ...query,
        where: { id: { in: ids }, userId: req.user!.id, isRecycled: true, ...(query as any)?.where },
      });

      const updatedData = unUpdated.map((data) => ({ ...data, isRecycled: false, deleteAt: null })) as any;
      if (funcBeforeRes) await funcBeforeRes(updatedData, req, res);

      res
        .body({ success: updatedData })
        .info(`${updatedData.length} ${pluralize(model.modelName, updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
