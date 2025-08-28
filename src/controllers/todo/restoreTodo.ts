import { Todo } from "@/models/Todo";
import { restoreOne } from "../templates/restoreOne";

export const restoreTodo = () => {
  return restoreOne(Todo);
};
