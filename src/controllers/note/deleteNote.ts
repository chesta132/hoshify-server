import { Note } from "@/models/Note";
import { softDeleteOne } from "../templates/softDeleteOne";
import { softDeleteMany } from "../templates/softDeleteMany";

export const deleteNote = () => {
  return softDeleteOne(Note);
};

export const deleteNotes = () => {
  return softDeleteMany(Note);
};
