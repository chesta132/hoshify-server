import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Schedule } from "@/models/Schedule";

export const editSchedule = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    const { title, details, start, end } = req.body;

    const schedule = await Schedule.updateByIdAndNormalize(
      id,
      {
        title,
        details,
        start,
        end,
      },
      { options: { new: true, runValidators: true } }
    );
    if (!schedule) {
      res.tempNotFound("schedule").respond();
      return;
    }
    res
      .body({ success: schedule })
      .notif(`${schedule.title.ellipsis(30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
