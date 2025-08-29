import { createTodo } from "@/controllers/todo/createTodo";
import { deleteTodo, deleteTodos } from "@/controllers/todo/deleteTodo";
import { editTodo } from "@/controllers/todo/editTodo";
import { getTodo } from "@/controllers/todo/getTodo";
import { getTodos } from "@/controllers/todo/getTodos";
import { restoreTodo, restoreTodos } from "@/controllers/todo/restoreTodo";
import { Router } from "express";

export const todoRoutes = Router();

todoRoutes.post("/", createTodo);
todoRoutes.get("/", getTodos());
todoRoutes.get("/:id", getTodo());
todoRoutes.put("/:id", editTodo);
todoRoutes.delete("/", deleteTodos());
todoRoutes.delete("/:id", deleteTodo());
todoRoutes.patch("/restores/", restoreTodos());
todoRoutes.patch("/restores/:id", restoreTodo());
