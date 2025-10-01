import { NextFunction, Request, Response } from "express";
import pluralize from "pluralize";
import { validateRequires } from "@/utils/validate";
import { pick } from "@/utils/manipulate/object";
import { ControllerConfig, ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";

export const createManyFactory = <
  M extends Model,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { neededField, acceptableField }: ControllerConfig<M, NF, AF>,
  { query, funcBeforeRes, funcInitiator, transformData }: ControllerOptions<InferByModel<M>[], ArgsOf<M["create"]>, NF, AF, "transformData"> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const body: any[] = req.body;
      if (funcInitiator) if ((await funcInitiator(req, res)) === "stop") return;

      if (neededField) validateRequires(neededField as string[], req.body);

      let datas = body.map((b) => ({ ...pick(b, [...(neededField || []), ...(acceptableField || [])]), userId: user.id })) as any;
      if (transformData) datas = transformData(datas, req, res);

      const createdDatas = await (model.create as Function)({ ...query, data: datas });
      if (funcBeforeRes) await funcBeforeRes(createdDatas, req, res);

      res
        .body({ success: createdDatas })
        .info(`${createdDatas.length} ${pluralize(model.modelName, createdDatas.length)} added`)
        .created();
    } catch (err) {
      next(err);
    }
  };
};
