import { searchMany } from "@/controllers/search/searchMany";
import { Router } from "express";

export const searchRoutes = Router();

searchRoutes.get("/", searchMany);
