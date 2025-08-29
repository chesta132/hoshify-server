import { getMany } from "../templates/getMany";
import { Schedule } from "@/models/Schedule";

export const getSchedules = () => {
  return getMany(Schedule);
};
