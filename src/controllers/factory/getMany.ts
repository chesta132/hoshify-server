import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { ControllerOptions } from "@/types";
import { Model } from "mongoose";
import { getMany } from "@/services/crud/read";
import { omit } from "@/utils/manipulate/object";

export const getManyFactory = <T extends Record<string, any>>(model: Model<T>, options?: Omit<ControllerOptions<T[]>, "funcInitiator">) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const { offset } = req.query;
      const limit = 30;
      const skip = parseInt(offset?.toString() || "0") || 0;

      const data = await getMany(
        model,
        { userId: user.id, ...options?.filter },
        { options: { limit, skip, ...options?.settings?.options }, ...omit(options?.settings || {}, ["options"]) }
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
