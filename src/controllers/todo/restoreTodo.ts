import { Todo } from "@/models/Todo";
import { restoreOne } from "../templates/restoreOne";
import { restoreMany } from "../templates/restoreMany";

export const restoreTodo = () => {
  return restoreOne(Todo);
};

export const restoreTodos = () => {
  return restoreMany(Todo);
};
