import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { Normalized } from "@/types/types";
import { getDeleteTTL } from "@/utils/database";
import pluralize from "pluralize";

export const softDeleteMany = <T extends { isRecycled: boolean; deleteAt: Date | null }>(
  model: Model<T>,
  funcBeforeRes?: (data: Normalized<T>[]) => any
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

      const deleteAt = getDeleteTTL();
      await model.updateMany({ _id: { $in: ids } }, { isRecycled: true, deleteAt }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data.normalize(), isRecycled: true, deleteAt }));
      if (funcBeforeRes) await funcBeforeRes(updatedData);

      res
        .body({ success: updatedData })
        .notif(`${updatedData.length} ${pluralize(model.getName(), updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
