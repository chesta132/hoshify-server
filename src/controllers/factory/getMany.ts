import { NextFunction, Request, Response } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";

export const getManyFactory = <
  M extends Model,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>[], ArgsOf<M["findMany"]>, NF, AF>
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { offset } = req.query;
      const limit = 30;
      const skip = parseInt(offset?.toString() || "0") || 0;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const data = (await model.findMany({
        ...query,
        where: { userId: user.id as string, ...(query as any).where },
      })) as unknown as InferByModel<M>[];
      if (funcBeforeRes) {
        await funcBeforeRes(data, req, res);
      }

      res
        .body({ success: data })
        .paginate({
          limit,
          offset: skip,
        })
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
