import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Database } from "@/class/Database";
import { NormalizedData } from "@/types/types";

export const softDeleteOne = async <T extends { isRecycled: boolean; title: string }>(
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

    const data = await model.softDeleteById(id, undefined, { options: { new: true, runValidators: true } });
    if (!data) {
      res.tempNotFound(model.collection.name.plural());
      return;
    }
    if (funcBeforeRes) await funcBeforeRes(data);

    res
      .body({ success: data })
      .notif(`${data.title.ellipsis(10)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
