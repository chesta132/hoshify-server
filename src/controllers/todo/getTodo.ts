import { Todo } from "@/models/Todo";
import { getOne } from "../templates/getOne";

export const getTodo = () => {
  return getOne(Todo);
};
