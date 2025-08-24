import { Request, Response } from "express";
import { Todo } from "@/models/Todo";
import { getOne } from "../templates/getOne";

export const getTodo = async (req: Request, { res }: Response) => {
  await getOne(Todo, req, res);
};
