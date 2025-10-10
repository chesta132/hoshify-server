import { searchNotes } from "@/controllers/note/noteFactory";
import { searchSchedules } from "@/controllers/schedule/scheduleFactory";
import { searchMany } from "@/controllers/search/searchMany";
import { searchTodos } from "@/controllers/todo/todoFactory";
import { Router } from "express";

export const searchRoutes = Router();

searchRoutes.get("/", searchMany);
searchRoutes.get("/todos", searchTodos);
searchRoutes.get("/notes", searchNotes);
searchRoutes.get("/schedules", searchSchedules);
