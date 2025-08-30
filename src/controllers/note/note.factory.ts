import { createMany } from "../templates/createMany";
import { getMany } from "../templates/getMany";
import { Note } from "@/models/Note";
import { getOne } from "../templates/getOne";
import { restoreMany } from "../templates/restoreMany";
import { restoreOne } from "../templates/restoreOne";
import { softDeleteMany } from "../templates/softDeleteMany";
import { softDeleteOne } from "../templates/softDeleteOne";
import { editMany } from "../templates/editMany";

export const createNotes = createMany(Note, ["title", "details"]);

export const getNotes = getMany(Note);

export const getNote = getOne(Note);

export const restoreNote = restoreOne(Note);

export const restoreNotes = restoreMany(Note);

export const deleteNote = softDeleteOne(Note);

export const deleteNotes = softDeleteMany(Note);

export const editNotes = editMany(Note, []);
