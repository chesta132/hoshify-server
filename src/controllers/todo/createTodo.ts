import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";

export const createTodo = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details, status, dueDate } = req.body;
    if (!title || !details || !dueDate) {
      res.tempMissingFields("title, details").respond();
      return;
    }

    const todo = await Todo.createAndNormalize({
      title,
      details,
      status,
      dueDate,
      userId: user.id,
    });
    res.body({ success: todo }).notif(`${title} added`).respond();
  } catch (err) {
    handleError(err, res);
  }
};

export const dummyTodo = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { length } = req.body;
    const dummys = await Todo.generateDummy(length, {
      userId: { fixed: user.id },
      title: { dynamicString: "Dummy To-do" },
      details: { fixed: new Date().toFormattedString({ includeHour: true }) },
    });

    res
      .body({ success: dummys })
      .notif(`${length} to-do ${dummys?.plural("dummy")} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteTodoDummy = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const dummys = await Todo.deleteMany({ userId: user.id, dummy: true });

    res
      .body({ success: dummys })
      .notif(`${dummys.deletedCount} to-do ${dummys.deletedCount === 1 ? "dummy" : "dummys"} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
