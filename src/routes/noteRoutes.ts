import { createNote } from "@/controllers/note/createNote";
import { createNotes } from "@/controllers/note/createNotes";
import { deleteNote, deleteNotes } from "@/controllers/note/deleteNote";
import { editNote } from "@/controllers/note/editNote";
import { getNote } from "@/controllers/note/getNote";
import { getNotes } from "@/controllers/note/getNotes";
import { restoreNote, restoreNotes } from "@/controllers/note/restoreNote";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const noteRoutes = Router();

noteRoutes.post("/", polyBody(createNote, createNotes()));
noteRoutes.get("/", getNotes());
noteRoutes.get("/:id", getNote());
noteRoutes.put("/:id", editNote);
noteRoutes.delete("/:id", deleteNote());
noteRoutes.delete("/", deleteNotes());
noteRoutes.patch("/restores", restoreNotes());
noteRoutes.patch("restores/:id", restoreNote());
