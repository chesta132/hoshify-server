import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ControllerOptions } from "@/types/types";
import { Model } from "mongoose";
import { getMany } from "@/services/crud/read";

export const getManyFactory = <T extends Record<string, any>>(
  model: Model<T>,
  options?: Omit<ControllerOptions<T[]>, "funcInitiator"> & { isRecycled?: boolean }
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const { offset } = req.query;
      const limit = 30;
      const skip = parseInt(offset?.toString() || "0") || 0;

      const data = await getMany(
        model,
        { userId: user.id, isRecycled: options?.isRecycled || false },
        { options: { sort: { createdAt: -1 }, limit, skip } }
      );
      if (options?.funcBeforeRes) {
        await options.funcBeforeRes(data, req, res);
      }
      res
        .body({ success: data })
        .paginate({
          limit,
          offset: skip,
        })
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
