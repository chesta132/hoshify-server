import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";

export const editTodo = async (req: Request, { res }: Response) => {
  try {
    const { todoId, title, details, status, dueDate } = req.body;
    if (!todoId) {
      res.tempMissingFields("todo ID").respond();
      return;
    }

    const todo = await Todo.updateByIdAndNormalize(
      todoId,
      {
        title,
        details,
        status,
        dueDate,
      },
      { options: { new: true, runValidators: true } }
    );

    if (!todo) {
      res.tempNotFound("to-do");
      return;
    }

    res.body({ success: todo }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
