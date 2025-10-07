import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { restoreOneFactory } from "../factory/restoreOne";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";
import { Schedule } from "@/services/db/Schedule";
import { searchFactory } from "../factory/search";

export const createSchedules = createManyFactory(
  Schedule,
  { neededField: ["title", "details"], acceptableField: ["start", "end"] },
  {
    funcInitiator(req) {
      (req.body as any[]).forEach((data) => {
        if (!data?.end) data.end = data?.start;
      });
    },
  }
);

export const getSchedules = getManyFactory(Schedule, { query: { where: { isRecycled: false }, orderBy: { updatedAt: "desc" } } });

export const getRecycledSchedules = getManyFactory(Schedule, { query: { where: { isRecycled: true }, orderBy: { updatedAt: "desc" } } });

export const getSchedule = getOneFactory(Schedule);

export const restoreSchedule = restoreOneFactory(Schedule);

export const restoreSchedules = restoreManyFactory(Schedule, { query: { orderBy: { updatedAt: "desc" } } });

export const deleteSchedule = softDeleteOneFactory(Schedule);

export const deleteSchedules = softDeleteManyFactory(Schedule, { query: { orderBy: { updatedAt: "desc" } } });

export const updateSchedules = updateManyFactory(
  Schedule,
  { neededField: ["title", "details"], acceptableField: ["start", "end"] },
  { query: { orderBy: { updatedAt: "desc" } } }
);

export const createSchedule = createOneFactory(
  Schedule,
  { neededField: ["title", "details"], acceptableField: ["start", "end"] },
  {
    funcInitiator(req) {
      const { end, start } = req.body;
      if (!end) req.body.end = start;
    },
  }
);

export const updateSchedule = updateOneFactory(Schedule, { neededField: ["title", "details"], acceptableField: ["start", "end"] });

export const searchSchedules = searchFactory(
  Schedule,
  { searchFields: ["title"] },
  {
    query: { where: { isRecycled: false }, orderBy: { updatedAt: "desc" } },
  }
);
