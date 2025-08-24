import { Request, Response } from "express";
import { Note } from "@/models/Note";
import { getOne } from "../templates/getOne";

export const getNote = async (req: Request, { res }: Response) => {
  await getOne(Note, "note", req, res);
};
