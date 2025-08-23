import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";
import { User } from "@/models/User";

export const getTodo = async (req: Request, { res }: Response) => {
  try {
    const { todoId } = req.params;
    if (!todoId) {
      res.tempMissingFields("todo ID").respond();
      return;
    }

    const todo = await Todo.findByIdAndNormalize(todoId);
    if (!todo) {
      res.tempNotFound("to-do");
      return;
    }

    res.body({ success: todo }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
