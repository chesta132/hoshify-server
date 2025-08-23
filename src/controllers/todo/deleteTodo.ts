import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";

export const deleteTodo = async (req: Request, { res }: Response) => {
  try {
    const { todoId } = req.body;
    if (!todoId) {
      res.tempMissingFields("todo ID").respond();
      return;
    }

    const todo = await Todo.softDeleteById(todoId, {}, { options: { new: true, runValidators: true } });
    if (!todo) {
      res.tempNotFound("to-do");
      return;
    }

    res.body({ success: todo }).notif(`${todo.title} deleted`).respond();
  } catch (err) {
    handleError(err, res);
  }
};
