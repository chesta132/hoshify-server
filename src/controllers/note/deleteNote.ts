import { Request, Response } from "express";
import { Note } from "@/models/Note";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteNote = async (req: Request, { res }: Response) => {
  await softDeleteOne(Note, req, res);
};
