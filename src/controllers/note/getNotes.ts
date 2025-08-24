import { Request, Response } from "express";
import { Todo } from "@/models/Todo";
import { getMany } from "../templates/getMany";

export const getNotes = async (req: Request, { res }: Response) => {
  await getMany(Todo, req, res);
};
