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
  { neededField, acceptableField }: ControllerConfig<T, F>,
  options?: Omit<ControllerOptions<T[]>, "filter" | "settings">
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const body: any[] = req.body;
      const user = req.user!;
      let invalidDatas: string[] = [];

      const dataIds: string[] = [];
      body.forEach((data, idx) => {
        const id = data._id || data.id;
        if (isValidObjectId(id)) {
          dataIds.push(id);
        } else {
          invalidDatas.push(data?.title || `Index ${idx}`);
        }
      });

      if (invalidDatas.length > 0) {
        res.tempClientType("Object ID", `${invalidDatas.join(", ")} is not ObjectId.`).respond();
        return;
      }

      if (neededField) {
        body.forEach((item, idx) => {
          try {
            validateRequires(neededField, item);
          } catch (err) {
            invalidDatas.push(item?.title || `Index ${idx}`);
          }
        });

        if (invalidDatas.length > 0) {
          res.tempClientType("Validation", `Missing required fields in: ${invalidDatas.join(", ")}`).respond();
          return;
        }
      }

      if (options?.funcInitiator) {
        if ((await options.funcInitiator(req, res)) === "stop") return;
      }

      const datas = body.map((b, index) => ({
        ...pick(b, [...(neededField || []), ...(acceptableField || [])]),
        userId: user.id,
        _id: dataIds[index],
      }));

      await model.bulkWrite(
        datas.map((data) => ({
          updateOne: {
            filter: { _id: data._id, userId: user.id },
            update: omit(data as any, [...unEditableField, "_id"]),
          },
        }))
      );

      const updatedDatas = (
        await model.find({
          _id: { $in: dataIds },
          userId: user.id,
        })
      ).map((data) => data.normalize()) as NormalizedData<T>[];

      if (options?.funcBeforeRes) {
        await options.funcBeforeRes(updatedDatas, req, res);
      }

      res
        .body({ success: updatedDatas })
        .info(`${updatedDatas.length} ${pluralize(model.getName(), updatedDatas.length)} updated`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
