import { Schedule } from "@/models/Schedule";
import { restoreOne } from "../templates/restoreOne";
import { restoreMany } from "../templates/restoreMany";

export const restoreSchedule = () => {
  return restoreOne(Schedule);
};

export const restoreSchedules = () => {
  return restoreMany(Schedule);
};
