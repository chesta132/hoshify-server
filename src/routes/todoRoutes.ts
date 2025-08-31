import {
  createTodo,
  createTodos,
  deleteTodo,
  deleteTodos,
  updateTodo,
  updateTodos,
  getTodo,
  getTodos,
  restoreTodo,
  restoreTodos,
} from "@/controllers/todo/todo.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const todoRoutes = Router();

todoRoutes.post("/", polyBody(createTodo, createTodos));
todoRoutes.get("/", getTodos);
todoRoutes.get("/:id", getTodo);
todoRoutes.put("/:id", updateTodo);
todoRoutes.put("/", updateTodos);
todoRoutes.delete("/", deleteTodos);
todoRoutes.delete("/:id", deleteTodo);
todoRoutes.patch("/restores/", restoreTodos);
todoRoutes.patch("/restores/:id", restoreTodo);
