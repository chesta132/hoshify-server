import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";
import { ControllerTemplateOptions, Normalized } from "@/types/types";
import pluralize from "pluralize";
import { validateIds } from "@/utils/database";

export const restoreMany = <T extends { isRecycled: boolean; deleteAt: Date | null }>(model: Model<T>, options?: ControllerTemplateOptions<T[]>) => {
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

      await model.updateMany({ _id: { $in: ids } }, { isRecycled: false, deleteAt: null }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data.normalize(), isRecycled: false, deleteAt: null })) as Normalized<T>[];
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
