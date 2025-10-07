import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { restoreOneFactory } from "../factory/restoreOne";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";
import { Note } from "@/services/db/Note";
import { searchFactory } from "../factory/search";

export const createNotes = createManyFactory(Note, { neededField: ["title", "details"] });

export const getNotes = getManyFactory(Note, { query: { where: { isRecycled: false }, orderBy: { updatedAt: "desc" } } });

export const getRecycledNotes = getManyFactory(Note, { query: { where: { isRecycled: true }, orderBy: { updatedAt: "desc" } } });

export const getNote = getOneFactory(Note);

export const restoreNote = restoreOneFactory(Note);

export const restoreNotes = restoreManyFactory(Note, { query: { orderBy: { updatedAt: "desc" } } });

export const deleteNote = softDeleteOneFactory(Note);

export const deleteNotes = softDeleteManyFactory(Note);

export const updateNotes = updateManyFactory(Note, { neededField: ["title", "details"] }, { query: { orderBy: { updatedAt: "desc" } } });

export const createNote = createOneFactory(Note, { neededField: ["title", "details"] });

export const updateNote = updateOneFactory(Note, { neededField: ["title", "details"] });

export const searchNotes = searchFactory(
  Note,
  { searchFields: ["title"] },
  {
    query: { where: { isRecycled: false }, orderBy: { updatedAt: "desc" } },
  }
);
