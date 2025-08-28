import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Schedule } from "@/models/Schedule";
import { ellipsis } from "@/utils/manipulate";

export const editSchedule = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    const { title, details, start, end } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      {
        title,
        details,
        start,
        end,
      },
      { new: true, runValidators: true }
    ).normalize();
    if (!schedule) {
      res.tempNotFound("schedule").respond();
      return;
    }
    res
      .body({ success: schedule })
      .notif(`${ellipsis(schedule.title, 30)} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
