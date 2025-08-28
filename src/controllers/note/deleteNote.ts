import { Note } from "@/models/Note";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteNote = () => {
  return softDeleteOne(Note);
};
