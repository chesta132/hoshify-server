import { createLink } from "@/controllers/link/createLink";
import { deleteLink } from "@/controllers/link/deleteLink";
import { editLink } from "@/controllers/link/editLink";
import { getSchedules } from "@/controllers/schedule/getSchedules";
import { Router } from "express";

export const linkRoutes = Router();

linkRoutes.post("/", createLink);
linkRoutes.get("/", getSchedules);
linkRoutes.put("/:id", editLink);
linkRoutes.delete("/:id", deleteLink);
