import { restoreOne } from "../templates/restoreOne";
import { Note } from "@/models/Note";

export const restoreNote = () => {
  return restoreOne(Note);
};
