import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Schedule } from "@/models/Schedule";

export const createSchedule = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details, start, end } = req.body;
    if (!title || !details || !start) {
      res.tempMissingFields("title, details, start").respond();
      return;
    }

    const schedule = await Schedule.createAndNormalize({
      title,
      details,
      userId: user.id,
      start,
      end,
    });
    res
      .body({ success: schedule })
      .notif(`${schedule.title.ellipsis(30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
