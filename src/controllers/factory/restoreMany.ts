import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";
import { ControllerOptions } from "@/types/types";
import pluralize from "pluralize";
import { validateIds } from "@/utils/validate";
import { getMany } from "@/services/crud/read";
import { updateMany } from "@/services/crud/update";

export const restoreManyFactory = <T extends { isRecycled: boolean; deleteAt: Date | null }>(model: Model<T>, options?: ControllerOptions<T, []>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const ids: string[] = req.body;
      validateIds(ids);

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const unUpdated = await getMany(model, { _id: { $in: ids }, userId: req.user!.id, isRecycled: true });

      await updateMany(
        model,
        { _id: { $in: ids }, userId: req.user!.id, isRecycled: true, ...options?.filter },
        { isRecycled: false, deleteAt: null },
        { options: { runValidators: true }, ...options?.settings }
      );

      const updatedData = unUpdated.map((data) => ({ ...data, isRecycled: false, deleteAt: null }));
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
