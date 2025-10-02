import { NextFunction, Request, Response } from "express";
import { ControllerConfig, ControllerOptions } from "../types";
import { ArgsOf, InferByModel, Model } from "@/services/db/types";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/services/error/AppError";
import { prisma } from "@/services/db";
import { omit, pick } from "@/utils/manipulate/object";
import { unEditableField } from "@/services/db/Base";
import pluralize from "pluralize";

export const updateManyFactory = <
  M extends Model,
  NF extends keyof InferByModel<M>,
  AF extends Exclude<keyof InferByModel<M>, NF> = Exclude<keyof InferByModel<M>, NF>
>(
  model: M,
  { neededField, acceptableField }: ControllerConfig<M, NF, AF>,
  { query, funcBeforeRes, funcInitiator }: ControllerOptions<InferByModel<M>[], ArgsOf<M["update"]> & ArgsOf<M["findMany"]>, NF, AF> = {}
) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const body: any[] = req.body;
      const user = req.user!;
      let invalidDatas: string[] = [];

      const dataIds: string[] = body.map((b) => b.id);

      if (neededField) {
        body.forEach((item, idx) => {
          try {
            validateRequires(neededField as string[], item);
          } catch (err) {
            invalidDatas.push(item?.title || `Index ${idx}`);
          }
        });

        if (invalidDatas.length > 0) {
          throw new AppError("CLIENT_TYPE", { fields: "Ids", details: `Missing required fields in: ${invalidDatas.join(", ")}` });
        }
      }

      if (funcInitiator) {
        if ((await funcInitiator(req, res)) === "stop") return;
      }

      const datas = body.map((b, index) => ({
        ...pick(b, [...(neededField || []), ...(acceptableField || [])]),
        userId: user.id,
        id: dataIds[index],
        ...query?.data,
      }));

      const updated = await prisma.$transaction(
        datas.map((data) =>
          (prisma[model.modelName].update as Function)({
            ...query,
            where: { id: data.id, userId: data.userId, ...query?.where },
            data: { ...omit(data as any, [...unEditableField, "id"]), ...query?.data },
          })
        )
      );

      const updatedDatas = (await model.findMany({ ...query, where: { id: { in: updated.map((u) => u.id) } } } as any)) as any;

      if (funcBeforeRes) {
        await funcBeforeRes(updatedDatas, req, res);
      }

      res
        .body({ success: updatedDatas })
        .info(`${updatedDatas.length} ${pluralize(model.modelName, updatedDatas.length)} updated`)
        .respond();
    } catch (err) {
      next(err);
    }
  };
};
