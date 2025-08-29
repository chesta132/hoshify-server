import { createMany } from "../templates/createMany";
import { Todo } from "@/models/Todo";

export const createTodos = () => {
  return createMany(Todo, ["title", "details", "dueDate"]);
};
