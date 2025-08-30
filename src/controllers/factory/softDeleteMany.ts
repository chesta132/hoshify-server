import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";
import { ControllerTemplateOptions } from "@/types/types";
import { getDeleteTTL, validateIds } from "@/utils/database";
import pluralize from "pluralize";

export const softDeleteMany = <T extends { isRecycled: boolean; deleteAt: Date | null }>(
  model: Model<T>,
  options?: ControllerTemplateOptions<T[]>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const ids: string[] = req.body;
      if (!validateIds(ids, res)) return;

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const unUpdated = await model.find({ _id: { $in: ids } });
      if (unUpdated.some((data) => data.isRecycled)) {
        res.tempNotFound(model.getName()).respond();
        return;
      }

      const deleteAt = getDeleteTTL();
      await model.updateMany({ _id: { $in: ids } }, { isRecycled: true, deleteAt }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data.normalize(), isRecycled: true, deleteAt }));
      if (options?.funcBeforeRes) await options.funcBeforeRes(updatedData, req, res);

      res
        .body({ success: updatedData })
        .notif(`${updatedData.length} ${pluralize(model.getName(), updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
