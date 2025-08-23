import { createTodo } from "@/controllers/todo/createTodo";
import { deleteTodo } from "@/controllers/todo/deleteTodo";
import { editTodo } from "@/controllers/todo/editTodo";
import { getTodo } from "@/controllers/todo/getTodo";
import { getTodos } from "@/controllers/todo/getTodos";
import { Router } from "express";

export const todoRoutes = Router();

todoRoutes.post("/", createTodo);
todoRoutes.get("/", getTodos);
todoRoutes.get("/:todoId", getTodo);
todoRoutes.put("/", editTodo);
todoRoutes.delete("/", deleteTodo);
