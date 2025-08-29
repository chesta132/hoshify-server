import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { NormalizedData } from "@/types/types";
import { Model } from "mongoose";

export const getMany = <T extends Record<string, any>>(model: Model<T>, funcBeforeRes?: (data: NormalizedData<T>[]) => any) => {
  return async (req: Request, { res }: Response) => {
    try {
      const user = req.user!;
      const { offset } = req.query;
      const limit = 30;
      const skip = parseInt(offset?.toString() || "0") || 0;

      const data = await model.find({ userId: user.id, isRecycled: false }, undefined, { sort: { createdAt: -1 }, limit, skip }).normalize();
      if (funcBeforeRes) {
        await funcBeforeRes(data);
      }
      console.debug(offset);
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
