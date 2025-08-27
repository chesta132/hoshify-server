import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { NormalizedData } from "@/types/types";
import { User } from "@/models/User";

export const getOne = async <T extends Record<string, any>>(
  model: Model<T>,
  req: Request,
  res: Response["res"],
  funcBeforeRes?: (data: NormalizedData<T>) => Promise<any> | any
) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const data = await model.findById(id).normalize();
    const s = await User.restoreById('')
    if (!data) {
      res.tempNotFound(model.collection.name.slice(0, -1).toLowerCase()).respond();
      return;
    }
    if (funcBeforeRes) await funcBeforeRes(data);

    res.body({ success: data }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
