import { Request, Response } from "express";
import { getMany } from "../templates/getMany";
import { Schedule } from "@/models/Schedule";

export const getSchedules = async (req: Request, { res }: Response) => {
  await getMany(Schedule, req, res);
};
