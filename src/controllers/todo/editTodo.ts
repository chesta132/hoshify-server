import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";
import { isValidObjectId } from "mongoose";

export const editTodo = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    const { title, details, status, dueDate } = req.body;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const todo = await Todo.updateByIdAndNormalize(
      id,
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
