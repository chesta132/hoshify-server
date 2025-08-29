import { Todo } from "@/models/Todo";
import { getMany } from "../templates/getMany";

export const getNotes = () => {
  return getMany(Todo);
};
