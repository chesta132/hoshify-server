import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { NormalizedData } from "@/types/types";

export const getOne = <T extends Record<string, any>>(model: Model<T>, funcBeforeRes?: (data: NormalizedData<T>) => any) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = await model.findById(id).normalize();
      if (!data) {
        res.tempNotFound(model.getName()).respond();
        return;
      }
      if (funcBeforeRes) await funcBeforeRes(data);

      res.body({ success: data }).respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
