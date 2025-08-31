import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";
import { ControllerOptions } from "@/types/types";
import { getDeleteTTL } from "@/utils/database/plugin";
import pluralize from "pluralize";
import { validateIds } from "@/utils/validate";

export const softDeleteManyFactory = <T extends { isRecycled: boolean; deleteAt: Date | null }>(
  model: Model<T>,
  options?: ControllerOptions<T[]>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const ids: string[] = req.body;
      validateIds(ids);

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const unUpdated = await model.find({ _id: { $in: ids }, userId: req.user!.id, isRecycled: false });

      const deleteAt = getDeleteTTL();
      await model.updateMany({ _id: { $in: ids }, userId: req.user!.id, isRecycled: false }, { isRecycled: true, deleteAt }, { runValidators: true });

      const updatedData = unUpdated.map((data) => ({ ...data.normalize(), isRecycled: true, deleteAt }));
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
