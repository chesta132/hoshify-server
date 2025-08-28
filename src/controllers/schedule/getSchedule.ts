import { getOne } from "../templates/getOne";
import { Schedule } from "@/models/Schedule";

export const getSchedule = () => {
  return getOne(Schedule);
};
