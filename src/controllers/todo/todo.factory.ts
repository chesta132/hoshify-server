import { createMany } from "../templates/createMany";
import { Todo } from "@/models/Todo";
import { getMany } from "../templates/getMany";
import { getOne } from "../templates/getOne";
import { restoreOne } from "../templates/restoreOne";
import { restoreMany } from "../templates/restoreMany";
import { softDeleteMany } from "../templates/softDeleteMany";
import { softDeleteOne } from "../templates/softDeleteOne";
import { editMany } from "../templates/editMany";

export const createTodos = createMany(Todo, ["title", "details", "dueDate"]);

export const getTodos = getMany(Todo);

export const getTodo = getOne(Todo);

export const restoreTodo = restoreOne(Todo);

export const restoreTodos = restoreMany(Todo);

export const deleteTodo = softDeleteOne(Todo);

export const deleteTodos = softDeleteMany(Todo);

export const editTodos = editMany(Todo, []);
