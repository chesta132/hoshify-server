import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import pluralize from "pluralize";
import { Model } from "mongoose";
import { ControllerTemplateOptions, NormalizedData } from "@/types/types";

export const createMany = <T>(model: Model<T>, neededField: string[], options?: ControllerTemplateOptions<T[]>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const datas: any[] = req.body;
      if (options?.funcInitiator) await options.funcInitiator(req, res);

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
        data.userId = user.id;
      });

      const createdDatas = (await model.create(datas)).map((data) => data.normalize()) as NormalizedData<T>[];
      if (options?.funcBeforeRes) await options.funcBeforeRes(createdDatas, req, res);

      res
        .body({ success: createdDatas })
        .notif(`${createdDatas.length} ${pluralize(model.getName(), createdDatas.length)} added`)
        .created();
    } catch (err) {
      handleError(err, res);
    }
  };
};
