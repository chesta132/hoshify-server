import { createMany } from "../templates/createMany";
import { Schedule } from "@/models/Schedule";

export const createSchedules = () => {
  return createMany(
    Schedule,
    ["title", "details"],
    () => {},
    (data) => {
      if (!data?.end) data.end = data?.start;
    }
  );
};
