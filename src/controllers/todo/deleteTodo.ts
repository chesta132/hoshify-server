import { Request, Response } from "express";
import { Todo } from "@/models/Todo";
import { softDeleteOne } from "../templates/softDeleteOne";

export const deleteTodo = async (req: Request, { res }: Response) => {
  await softDeleteOne(Todo, req, res);
};
