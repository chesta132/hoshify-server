import { Schedule } from "@/models/Schedule";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteSchedule = () => {
  return softDeleteOne(Schedule);
};
