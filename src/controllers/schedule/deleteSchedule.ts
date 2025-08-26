import { Request, Response } from "express";
import { Schedule } from "@/models/Schedule";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteSchedule = async (req: Request, { res }: Response) => {
  await softDeleteOne(Schedule, req, res);
};
