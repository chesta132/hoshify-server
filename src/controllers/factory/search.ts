import { AppError } from "@/services/error/AppError";
import { Request, Response, NextFunction } from "express";
import { ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";
import { PAGINATION_LIMIT } from "@/config";

export const searchFactory = <
  M extends Exclude<Model, Model<"user">>,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>[], ArgsOf<M["findMany"]>, NF, AF> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const q = req.query.query?.toString().trim();
      const { offset } = req.query;
      const limit = PAGINATION_LIMIT;
      const skip = Number(offset?.toString()) || 0;

      if (!q) {
        throw new AppError("MISSING_FIELDS", { fields: "query" });
      }
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      const datas = (await model.findMany({
        ...query,
        where: { title: { contains: q, mode: "insensitive" }, userId: user.id, ...(query as any)?.where },
        take: limit,
        skip,
      })) as unknown as InferByModel<M>[];

      if (funcBeforeRes) {
        await funcBeforeRes(datas, req, res);
      }

      res.body({ success: datas }).paginate({ limit, offset: skip }).respond();
    } catch (err) {
      next(err);
    }
  };
};
