import { deleteTodoDummy, dummyTodo } from "@/controllers/todo/createTodo";
import { Router } from "express";

export const dummyRoutes = Router();

dummyRoutes.post("/todo", dummyTodo);
dummyRoutes.delete("/todo", deleteTodoDummy);
