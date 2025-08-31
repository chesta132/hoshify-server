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
} from "@/controllers/note/note.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const noteRoutes = Router();

noteRoutes.post("/", polyBody(createNote, createNotes));
noteRoutes.get("/", getNotes);
noteRoutes.get("/:id", getNote);
noteRoutes.put("/:id", updateNote);
noteRoutes.put("/", updateNotes);
noteRoutes.delete("/:id", deleteNote);
noteRoutes.delete("/", deleteNotes);
noteRoutes.patch("/restores", restoreNotes);
noteRoutes.patch("restores/:id", restoreNote);
