import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Database } from "@/class/Database";
import { NormalizedData } from "@/types/types";

export const getMany = async <T extends Record<string, any>>(
  model: Database<T>,
  req: Request,
  res: Response["res"],
  funcBeforeRes?: (data: NormalizedData<T[]>) => Promise<any> | any
) => {
  try {
    const user = req.user!;
    const { offset } = req.query;
    const limit = 30;
    const skip = parseInt(offset?.toString() || "0") || 0;

    const data = await model.findAndNormalize(
      { userId: user.id, isRecycled: false },
      { returnArray: true, sort: { createdAt: -1 }, options: { limit, skip } }
    );
    if (funcBeforeRes) {
      await funcBeforeRes(data!);
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
