import { Request, Response } from "express";
import { Todo } from "@/models/Todo";
import { restoreOne } from "../templates/restoreOne";

export const restoreTodo = async (req: Request, { res }: Response) => {
  await restoreOne(Todo, req, res);
};
