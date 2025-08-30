import { createMany } from "../templates/createMany";
import { Schedule } from "@/models/Schedule";
import { getMany } from "../templates/getMany";
import { getOne } from "../templates/getOne";
import { restoreMany } from "../templates/restoreMany";
import { restoreOne } from "../templates/restoreOne";
import { softDeleteOne } from "../templates/softDeleteOne";
import { softDeleteMany } from "../templates/softDeleteMany";

export const createSchedules = createMany(Schedule, ["title", "details"], {
  funcInitiator(req) {
    (req.body as any[]).forEach((data) => {
      if (!data?.end) data.end = data?.start;
    });
  },
});

export const getSchedules = getMany(Schedule);

export const getSchedule = getOne(Schedule);

export const restoreSchedule = restoreOne(Schedule);

export const restoreSchedules = restoreMany(Schedule);

export const deleteSchedule = softDeleteOne(Schedule);

export const deleteSchedules = softDeleteMany(Schedule);
