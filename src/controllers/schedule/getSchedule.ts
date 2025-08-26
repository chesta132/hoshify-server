import { Request, Response } from "express";
import { getOne } from "../templates/getOne";
import { Schedule } from "@/models/Schedule";

export const getSchedule = async (req: Request, { res }: Response) => {
  await getOne(Schedule, req, res);
};
