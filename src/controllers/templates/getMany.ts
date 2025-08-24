import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Database } from "@/class/Database";

export const getMany = async <T extends Record<string, any>>(model: Database<T>, req: Request, res: Response["res"]) => {
  try {
    const user = req.user!;
    const { offset } = req.query;
    const limit = 30;
    const skip = parseInt(offset?.toString() || "0") || 0;

    const data = await model.findAndNormalize(
      { userId: user.id, isRecycled: false },
      { returnArray: true, sort: { createdAt: -1 }, options: { limit, skip } }
    );
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
