import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { Normalized } from "@/types/types";

export const restoreOne = async <T extends { isRecycled: boolean; title: string; deleteAt: Date | null }>(
  model: Model<T>,
  funcBeforeRes?: (data: Normalized<T>) => Promise<any> | any
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = (await model.restoreById(id))?.normalize();
      if (!data) {
        res.tempNotFound(model.collection.name.slice(0, -1).toLowerCase()).respond();
        return;
      }
      if (!data.isRecycled) {
        await model.findByIdAndUpdate(data.id, data);
        res.tempNotRecycled(data.title).respond();
        return;
      }
      if (funcBeforeRes) await funcBeforeRes(data);

      res
        .body({ success: { ...data, isRecycled: false, deleteAt: null } })
        .notif(`${data.title.ellipsis(30)} restored`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
