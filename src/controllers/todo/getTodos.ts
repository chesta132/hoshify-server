import { Todo } from "@/models/Todo";
import { getMany } from "../templates/getMany";

export const getTodos = () => {
  return getMany(Todo);
};
