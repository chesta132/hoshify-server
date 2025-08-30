import { createSchedule } from "@/controllers/schedule/createSchedule";
import { editSchedule } from "@/controllers/schedule/editSchedule";
import {
  createSchedules,
  deleteSchedule,
  deleteSchedules,
  editSchedules,
  getSchedule,
  getSchedules,
  restoreSchedule,
  restoreSchedules,
} from "@/controllers/schedule/schedule.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const scheduleRoutes = Router();

scheduleRoutes.post("/", polyBody(createSchedule, createSchedules));
scheduleRoutes.get("/", getSchedules);
scheduleRoutes.get("/:id", getSchedule);
scheduleRoutes.put("/:id", editSchedule);
scheduleRoutes.put('/', editSchedules)
scheduleRoutes.delete("/", deleteSchedules);
scheduleRoutes.delete("/:id", deleteSchedule);
scheduleRoutes.patch("/restores/", restoreSchedules);
scheduleRoutes.patch("/restores/:id", restoreSchedule);
