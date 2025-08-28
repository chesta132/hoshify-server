import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";
import { ellipsis } from "@/utils/manipulate";

export const createTodo = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details, status, dueDate } = req.body;
    if (!title || !details || !dueDate) {
      res.tempMissingFields("title, details, due date").respond();
      return;
    }

    const todo = await Todo.create({
      title,
      details,
      status,
      dueDate,
      userId: user.id,
    });
    res
      .body({ success: todo })
      .notif(`${ellipsis(todo.title, 30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
