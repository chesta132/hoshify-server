import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { Model } from "mongoose";
import { Normalized } from "@/types/types";

export const createMany = <T>(
  model: Model<T>,
  neededField: string[],
  funcManipData?: (data: any) => void,
  funcBeforeRes?: (data: Normalized<T>[]) => any
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const datas: any[] = req.body;

      const missingFields: string[] = [];
      const isValidField = datas.some((data) => {
        let state = false;
        for (const field in neededField) {
          if (!data[field]) {
            missingFields.push(field);
            state = false;
          }
          state = true;
        }
        return state;
      });
      if (!isValidField) {
        res.tempMissingFields(missingFields.join(", ")).respond();
        return;
      }

      datas.forEach((data) => {
        data.userId = user.id;
        if (funcManipData) funcManipData(data);
      });

      const createdDatas = (await model.create(datas)).map((data) => data.normalize());
      if (funcBeforeRes) await funcBeforeRes(createdDatas);

      res
        .body({ success: createdDatas })
        .notif(`${createdDatas.length} ${pluralize(model.getName(), createdDatas.length)} added`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
