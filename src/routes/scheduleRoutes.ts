import {
  createSchedule,
  createSchedules,
  deleteSchedule,
  deleteSchedules,
  updateSchedule,
  updateSchedules,
  getSchedule,
  getSchedules,
  restoreSchedule,
  restoreSchedules,
} from "@/controllers/schedule/scheduleFactory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const scheduleRoutes = Router();

scheduleRoutes.post("/", polyBody(createSchedule, createSchedules));
scheduleRoutes.get("/", getSchedules);
scheduleRoutes.get("/:id", getSchedule);
scheduleRoutes.put("/:id", updateSchedule);
scheduleRoutes.put("/", updateSchedules);
scheduleRoutes.delete("/", deleteSchedules);
scheduleRoutes.delete("/:id", deleteSchedule);
scheduleRoutes.patch("/restores/", restoreSchedules);
scheduleRoutes.patch("/restores/:id", restoreSchedule);
