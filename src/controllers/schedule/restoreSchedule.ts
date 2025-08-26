import { Request, Response } from "express";
import { Schedule } from "@/models/Schedule";
import { restoreOne } from "../templates/restoreOne";

export const restoreSchedule = async (req: Request, { res }: Response) => {
  await restoreOne(Schedule, req, res);
};
