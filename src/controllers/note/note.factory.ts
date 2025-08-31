import { createMany } from "../factory/createMany";
import { getMany } from "../factory/getMany";
import { Note } from "@/models/Note";
import { getOne } from "../factory/getOne";
import { restoreMany } from "../factory/restoreMany";
import { restoreOne } from "../factory/restoreOne";
import { softDeleteMany } from "../factory/softDeleteMany";
import { softDeleteOne } from "../factory/softDeleteOne";
import { updateMany } from "../factory/updateMany";
import { createOne } from "../factory/createOne";
import { updateOne } from "../factory/updateOne";

export const createNotes = createMany(Note, ["title", "details"]);

export const getNotes = getMany(Note);

export const getNote = getOne(Note);

export const restoreNote = restoreOne(Note);

export const restoreNotes = restoreMany(Note);

export const deleteNote = softDeleteOne(Note);

export const deleteNotes = softDeleteMany(Note);

export const updateNotes = updateMany(Note);

export const createNote = createOne(Note, ["title", "details"]);

export const updateNote = updateOne(Note);
