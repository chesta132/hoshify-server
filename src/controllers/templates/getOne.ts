import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Database } from "@/class/Database";
import { NormalizedData } from "@/types/types";

export const getOne = async <T extends Record<string, any>>(
  model: Database<T>,
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

    const data = await model.findByIdAndNormalize(id);
    if (!data) {
      res.tempNotFound(model.collection.name.plural());
      return;
    }
    if (funcBeforeRes) await funcBeforeRes(data);

    res.body({ success: data }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
