import { createMany } from "../factory/createMany";
import { Schedule } from "@/models/Schedule";
import { getMany } from "../factory/getMany";
import { getOne } from "../factory/getOne";
import { restoreMany } from "../factory/restoreMany";
import { restoreOne } from "../factory/restoreOne";
import { softDeleteOne } from "../factory/softDeleteOne";
import { softDeleteMany } from "../factory/softDeleteMany";
import { updateMany } from "../factory/updateMany";
import { createOne } from "../factory/createOne";
import { updateOne } from "../factory/updateOne";

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

export const updateSchedules = updateMany(Schedule);

export const createSchedule = createOne(Schedule, ["title", "details"], {
  funcInitiator(req) {
    const { end, start } = req.body;
    if (!end) req.body.end = start;
  },
});

export const updateSchedule = updateOne(Schedule);
