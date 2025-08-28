import { Note } from "@/models/Note";
import { getOne } from "../templates/getOne";

export const getNote = () => {
  return getOne(Note);
};
