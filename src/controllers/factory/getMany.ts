import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ControllerTemplateOptions, NormalizedData } from "@/types/types";
import { Model } from "mongoose";

export const getMany = <T extends Record<string, any>>(
  model: Model<T>,
  options?: Omit<ControllerTemplateOptions<T[]>, "funcInitiator"> & { isRecycled?: boolean }
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const { offset } = req.query;
      const limit = 30;
      const skip = parseInt(offset?.toString() || "0") || 0;

      const data = (await model
        .find({ userId: user.id, isRecycled: options?.isRecycled || false }, undefined, { sort: { createdAt: -1 }, limit, skip })
        .normalize()) as NormalizedData<T>[];
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
