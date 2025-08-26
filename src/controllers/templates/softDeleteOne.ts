import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Database } from "@/class/Database";
import { NormalizedData } from "@/types/types";
import { oneWeeks } from "@/utils/token";

export const softDeleteOne = async <T extends { isRecycled: boolean; title: string; deleteAt?: Date }>(
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

    const data = await model.softDeleteById(id);
    const deleteAt = new Date(Date.now() + oneWeeks);
    if (!data) {
      res.tempNotFound(model.collection.name.slice(0, -1).toLowerCase()).respond()
      return;
    }
    if (data.isRecycled) {
      await model.findByIdAndUpdate(data.id, data);
      res.tempIsRecycled(data.title).respond();
      return;
    }
    if (funcBeforeRes) await funcBeforeRes(data);

    res
      .body({ success: { ...data, isRecycled: true, deleteAt } })
      .notif(`${data.title.ellipsis(30)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
