import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";
import pluralize from "pluralize";

export const softDeleteManyFactory = <
  M extends Model<"note" | "transaction" | "todo" | "schedule">,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcInitiator, funcBeforeRes }: ControllerOptions<InferByModel<M>[], ArgsOf<M["softDeleteMany"]>, NF, AF>
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const ids: string[] = req.body;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const updatedData = await model.softDeleteMany({
        ...query,
        where: { id: { in: ids }, userId: req.user!.id as string, ...(query as any).where },
      });
      if (funcBeforeRes) await funcBeforeRes(updatedData as any, req, res);

      res
        .body({ success: updatedData })
        .info(`${updatedData.length} ${pluralize(model.modelName, updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
