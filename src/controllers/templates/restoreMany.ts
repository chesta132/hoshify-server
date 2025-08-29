import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { Normalized } from "@/types/types";
import pluralize from "pluralize";

export const restoreMany = <T extends { isRecycled: boolean; deleteAt: Date | null }>(
  model: Model<T>,
  funcBeforeRes?: (data: Normalized<T>[], body: any, req: Request, res: Response["res"]) => any
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { ids }: { ids?: string[] } = req.body;
      if (!ids || ids.some((id) => !isValidObjectId(id))) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const unUpdated = await model.find({ _id: { $in: ids } });
      if (unUpdated.some((data) => data.isRecycled)) {
        res.tempNotFound(model.getName()).respond();
        return;
      }

      await model.updateMany({ _id: { $in: ids } }, { isRecycled: false, deleteAt: null }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data.normalize(), isRecycled: false, deleteAt: null }));
      if (funcBeforeRes) await funcBeforeRes(updatedData, req.body, req, res);

      res
        .body({ success: updatedData })
        .notif(`${updatedData.length} ${pluralize(model.getName(), updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
