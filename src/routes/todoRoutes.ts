import { editTodo } from "@/controllers/todo/editTodo";
import { createTodo, createTodos, deleteTodo, deleteTodos, editTodos, getTodo, getTodos, restoreTodo, restoreTodos } from "@/controllers/todo/todo.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const todoRoutes = Router();

todoRoutes.post("/", polyBody(createTodo, createTodos));
todoRoutes.get("/", getTodos);
todoRoutes.get("/:id", getTodo);
todoRoutes.put("/:id", editTodo);
todoRoutes.put("/", editTodos);
todoRoutes.delete("/", deleteTodos);
todoRoutes.delete("/:id", deleteTodo);
todoRoutes.patch("/restores/", restoreTodos);
todoRoutes.patch("/restores/:id", restoreTodo);
