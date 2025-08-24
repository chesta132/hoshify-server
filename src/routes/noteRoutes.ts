import { createNote } from "@/controllers/note/createNote";
import { deleteNote } from "@/controllers/note/deleteNote";
import { editNote } from "@/controllers/note/editNote";
import { getNote } from "@/controllers/note/getNote";
import { getNotes } from "@/controllers/note/getNotes";
import { Router } from "express";

export const noteRoutes = Router()

noteRoutes.post("/", createNote);
noteRoutes.get("/", getNotes);
noteRoutes.get("/:id", getNote);
noteRoutes.put("/:id", editNote);
noteRoutes.delete("/:id", deleteNote);
