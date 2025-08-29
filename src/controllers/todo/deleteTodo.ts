import { Todo } from "@/models/Todo";
import { softDeleteOne } from "../templates/softDeleteOne";
import { softDeleteMany } from "../templates/softDeleteMany";

export const deleteTodo = () => {
  return softDeleteOne(Todo);
};

export const deleteTodos = () => {
  return softDeleteMany(Todo);
};
