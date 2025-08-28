import { Todo } from "@/models/Todo";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteTodo = () => {
  return softDeleteOne(Todo);
};
