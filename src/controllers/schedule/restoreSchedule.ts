import { Schedule } from "@/models/Schedule";
import { restoreOne } from "../templates/restoreOne";

export const restoreSchedule = () => {
  return restoreOne(Schedule);
};
