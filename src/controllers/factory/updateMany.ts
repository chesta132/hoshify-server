import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { isValidObjectId, Model } from "mongoose";
import { ControllerConfig, ControllerOptions, NormalizedData } from "@/types/types";
import { omit, pick } from "@/utils/manipulate/object";
import { unEditableField } from "@/utils/database/plugin";
import { validateRequires } from "@/utils/validate";

export const updateManyFactory = <T, F extends string>(
  model: Model<T>,
  { neededField, acceptableField }: ControllerConfig<T, F> = {},
  options?: ControllerOptions<T[]>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const body: any[] = req.body;
      const user = req.user!;
      let invalidDatas: string[] = [];

      const isObjectId = body.every((data, idx) => {
        if (isValidObjectId(data._id) || isValidObjectId(data.id)) return true;
        else {
          invalidDatas.push(data?.title || `Index ${idx}`);
          return false;
        }
      });

      if (!isObjectId) {
        res.tempClientType("Object ID", `${invalidDatas.join(", ")} is not ObjectId.`).respond();
        return;
      }

      if (neededField) validateRequires(neededField, req.body);

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const dataIds = body.map((data) => data._id || data.id);

      const datas = body.map((b) => ({ ...pick(b, [...(neededField || []), ...(acceptableField || [])]), userId: user.id })) as T[];
      await model.bulkWrite(
        datas.map((data) => ({
          updateOne: {
            filter: { _id: dataIds },
            update: omit(data as any, unEditableField),
          },
        }))
      );

      const updatedDatas = (await model.find({ _id: { $in: dataIds }, userId: req.user!.id })).map((data) => data.normalize()) as NormalizedData<T>[];
      if (options?.funcBeforeRes) await options.funcBeforeRes(updatedDatas, req, res);

      res
        .body({ success: updatedDatas })
        .info(`${updatedDatas.length} ${pluralize(model.getName(), updatedDatas.length)} updated`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
