import { createSchedule } from "@/controllers/schedule/createSchedule";
import { createSchedules } from "@/controllers/schedule/createSchedules";
import { deleteSchedule, deleteSchedules } from "@/controllers/schedule/deleteSchedule";
import { editSchedule } from "@/controllers/schedule/editSchedule";
import { getSchedule } from "@/controllers/schedule/getSchedule";
import { getSchedules } from "@/controllers/schedule/getSchedules";
import { restoreSchedule, restoreSchedules } from "@/controllers/schedule/restoreSchedule";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const scheduleRoutes = Router();

scheduleRoutes.post("/", polyBody(createSchedule, createSchedules()));
scheduleRoutes.get("/", getSchedules());
scheduleRoutes.get("/:id", getSchedule());
scheduleRoutes.put("/:id", editSchedule);
scheduleRoutes.delete("/", deleteSchedules());
scheduleRoutes.delete("/:id", deleteSchedule());
scheduleRoutes.patch("/restores/", restoreSchedules());
scheduleRoutes.patch("/restores/:id", restoreSchedule());
