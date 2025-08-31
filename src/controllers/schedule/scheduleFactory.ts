import { createManyFactory } from "../factory/createMany";
import { Schedule } from "@/models/Schedule";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { restoreOneFactory } from "../factory/restoreOne";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";

export const createSchedules = createManyFactory(Schedule, ["title", "details"], {
  funcInitiator(req) {
    (req.body as any[]).forEach((data) => {
      if (!data?.end) data.end = data?.start;
    });
  },
});

export const getSchedules = getManyFactory(Schedule);

export const getSchedule = getOneFactory(Schedule);

export const restoreSchedule = restoreOneFactory(Schedule);

export const restoreSchedules = restoreManyFactory(Schedule);

export const deleteSchedule = softDeleteOneFactory(Schedule);

export const deleteSchedules = softDeleteManyFactory(Schedule);

export const updateSchedules = updateManyFactory(Schedule);

export const createSchedule = createOneFactory(Schedule, ["title", "details"], {
  funcInitiator(req) {
    const { end, start } = req.body;
    if (!end) req.body.end = start;
  },
});

export const updateSchedule = updateOneFactory(Schedule);
