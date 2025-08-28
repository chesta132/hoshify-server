import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { Normalized } from "@/types/types";
import { oneWeeks } from "@/utils/token";
import { ellipsis } from "@/utils/manipulate";

export const softDeleteOne = <T extends { isRecycled: boolean; title: string; deleteAt: Date | null }>(
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

      const data = (await model.softDeleteById(id))?.normalize();
      const deleteAt = new Date(Date.now() + oneWeeks);
      if (!data) {
        res.tempNotFound(model.collection.name.slice(0, -1).toLowerCase()).respond();
        return;
      }
      if (data.isRecycled) {
        await model.findByIdAndUpdate(data.id, data).normalize();
        res.tempIsRecycled(data.title).respond();
        return;
      }
      if (funcBeforeRes) await funcBeforeRes(data);

      res
        .body({ success: { ...data, isRecycled: true, deleteAt } })
        .notif(`${ellipsis(data.title, 30)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
