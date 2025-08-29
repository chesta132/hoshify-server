import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { Model } from "mongoose";
import { Normalized } from "@/types/types";
import { omit } from "@/utils/manipulate";

export const editMany = <T>(
  model: Model<T>,
  neededField: string[],
  customValidation?: (body: any[], req: Request, res: Response["res"]) => any,
  funcManipBody?: (body: any, req: Request, res: Response["res"]) => void,
  funcBeforeRes?: (data: Normalized<T>[], body: any[], req: Request, res: Response["res"]) => any
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const datas: any[] = req.body;
      if (customValidation) await customValidation(datas, req, res);

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

      datas.forEach((data) => {
        if (funcManipBody) funcManipBody(data, req, res);
      });
      const dataIds = datas.map((data) => data._id || data.id);

      await model.bulkWrite(
        datas.map((data) => ({
          updateOne: {
            filter: { _id: dataIds },
            update: omit(data, ["id", "_id", "userId"]),
          },
        }))
      );

      const updatedDatas = (await model.find({ _id: { $in: dataIds } })).map((data) => data.normalize());
      if (funcBeforeRes) await funcBeforeRes(updatedDatas, datas, req, res);

      res
        .body({ success: updatedDatas })
        .notif(`${updatedDatas.length} ${pluralize(model.getName(), updatedDatas.length)} updated`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
