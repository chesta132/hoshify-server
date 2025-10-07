import {
  createNote,
  createNotes,
  deleteNote,
  deleteNotes,
  updateNote,
  updateNotes,
  getNote,
  getNotes,
  restoreNote,
  restoreNotes,
  searchNotes,
  getRecycledNotes,
} from "@/controllers/note/noteFactory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const noteRoutes = Router();

noteRoutes.post("/", polyBody(createNote, createNotes));
noteRoutes.get("/", getNotes);
noteRoutes.get("/search", searchNotes);
noteRoutes.get("/:id", getNote);
noteRoutes.put("/:id", updateNote);
noteRoutes.put("/", updateNotes);
noteRoutes.delete("/:id", deleteNote);
noteRoutes.delete("/", deleteNotes);
noteRoutes.patch("/restores", restoreNotes);
noteRoutes.patch("/restores/:id", restoreNote);
noteRoutes.get("/recycled", getRecycledNotes);
