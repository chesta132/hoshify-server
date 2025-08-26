import { Request, Response } from "express";
import { restoreOne } from "../templates/restoreOne";
import { Note } from "@/models/Note";

export const restoreNote = async (req: Request, { res }: Response) => {
  await restoreOne(Note, req, res);
};
