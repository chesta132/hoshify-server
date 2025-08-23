import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";

export const getNotes = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { offset } = req.query;
    const limit = 30;
    const skip = parseInt(offset?.toString() || "0") || 0;

    const notes = await Todo.findAndNormalize(
      { userId: user.id, isRecycled: false },
      { returnArray: true, sort: { createdAt: -1 }, options: { limit, skip } }
    );
    res
      .body({ success: notes })
      .paginate({
        limit,
        offset: skip,
      })
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
