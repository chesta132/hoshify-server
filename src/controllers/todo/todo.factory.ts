import { createMany } from "../factory/createMany";
import { Todo } from "@/models/Todo";
import { getMany } from "../factory/getMany";
import { getOne } from "../factory/getOne";
import { restoreOne } from "../factory/restoreOne";
import { restoreMany } from "../factory/restoreMany";
import { softDeleteMany } from "../factory/softDeleteMany";
import { softDeleteOne } from "../factory/softDeleteOne";
import { editMany } from "../factory/editMany";
import { createOne } from "../factory/createOne";

export const createTodos = createMany(Todo, ["title", "details", "dueDate"]);

export const getTodos = getMany(Todo);

export const getTodo = getOne(Todo);

export const restoreTodo = restoreOne(Todo);

export const restoreTodos = restoreMany(Todo);

export const deleteTodo = softDeleteOne(Todo);

export const deleteTodos = softDeleteMany(Todo);

export const editTodos = editMany(Todo, []);

export const createTodo = createOne(Todo, ["title", "details", "dueDate"]);
