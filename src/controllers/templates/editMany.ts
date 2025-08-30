import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { isValidObjectId, Model } from "mongoose";
import { ControllerTemplateOptions, Normalized, NormalizedData } from "@/types/types";
import { omit } from "@/utils/manipulate";

export const editMany = <T>(model: Model<T>, neededField: string[], options?: ControllerTemplateOptions<T[]>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const datas: any[] = req.body;
      if (options?.funcInitiator) await options.funcInitiator(req, res);
      let invalidDatas: string[] = [];

      const isObjectId = datas.every((data, idx) => {
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

      const missingFields: string[] = [];
      const isValidField = datas.every((data) => {
        return neededField.every((field) => {
          if (!data[field]) {
            missingFields.push(field);
            return false;
          }
          return true;
        });
      });
      if (!isValidField) {
        res.tempMissingFields(missingFields.join(", ")).respond();
        return;
      }

      const dataIds = datas.map((data) => data._id || data.id);

      await model.bulkWrite(
        datas.map((data) => ({
          updateOne: {
            filter: { _id: dataIds },
            update: omit(data, ["id", "_id", "userId"]),
          },
        }))
      );

      const updatedDatas = (await model.find({ _id: { $in: dataIds } })).map((data) => data.normalize()) as NormalizedData<T>[];
      if (options?.funcBeforeRes) await options.funcBeforeRes(updatedDatas, req, res);

      res
        .body({ success: updatedDatas })
        .notif(`${updatedDatas.length} ${pluralize(model.getName(), updatedDatas.length)} updated`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
