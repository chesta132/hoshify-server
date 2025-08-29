import { createMany } from "../templates/createMany";
import { Note } from "@/models/Note";

export const createNotes = () => {
  return createMany(Note, ["title", "details"]);
};
