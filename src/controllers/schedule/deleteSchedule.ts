import { Schedule } from "@/models/Schedule";
import { softDeleteOne } from "../templates/softDeleteOne";
import { softDeleteMany } from "../templates/softDeleteMany";

export const deleteSchedule = () => {
  return softDeleteOne(Schedule);
};

export const deleteSchedules = () => {
  return softDeleteMany(Schedule);
};
