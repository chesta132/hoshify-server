import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";
import { ControllerOptions, NormalizedData } from "@/types/types";
import { getDeleteTTL } from "@/utils/database/plugin";
import pluralize from "pluralize";
import { validateIds } from "@/utils/validate";
import db from "@/services/crud";

export const softDeleteManyFactory = <T extends { isRecycled: boolean; deleteAt: Date | null }>(
  model: Model<T>,
  options?: ControllerOptions<T[]>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const ids: string[] = req.body;
      validateIds(ids);

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const unUpdated = (await db.getMany(
        model,
        { _id: { $in: ids }, userId: req.user!.id, ...options?.filter },
        options?.settings
      )) as NormalizedData<T>[];

      const deleteAt = getDeleteTTL();
      await model.updateMany({ _id: { $in: ids }, userId: req.user!.id }, { isRecycled: true, deleteAt }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data, isRecycled: true, deleteAt }));
      if (options?.funcBeforeRes) await options.funcBeforeRes(updatedData, req, res);

      res
        .body({ success: updatedData })
        .info(`${updatedData.length} ${pluralize(model.getName(), updatedData.length)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
