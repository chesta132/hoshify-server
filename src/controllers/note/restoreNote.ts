import { restoreMany } from "../templates/restoreMany";
import { restoreOne } from "../templates/restoreOne";
import { Note } from "@/models/Note";

export const restoreNote = () => {
  return restoreOne(Note);
};

export const restoreNotes = () => {
  return restoreMany(Note);
};
