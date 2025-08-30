import { createNote } from "@/controllers/note/createNote";
import { editNote } from "@/controllers/note/editNote";
import { createNotes, deleteNote, deleteNotes, getNote, getNotes, restoreNote, restoreNotes } from "@/controllers/note/note.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const noteRoutes = Router();

noteRoutes.post("/", polyBody(createNote, createNotes));
noteRoutes.get("/", getNotes);
noteRoutes.get("/:id", getNote);
noteRoutes.put("/:id", editNote);
noteRoutes.delete("/:id", deleteNote);
noteRoutes.delete("/", deleteNotes);
noteRoutes.patch("/restores", restoreNotes);
noteRoutes.patch("restores/:id", restoreNote);
