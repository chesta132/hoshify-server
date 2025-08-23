import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";
import { isValidObjectId } from "mongoose";

export const deleteTodo = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Id").respond();
      return;
    }

    const note = await Todo.softDeleteById(id, {}, { options: { new: true, runValidators: true } });
    if (!note) {
      res.tempNotFound("note");
      return;
    }

    res
      .body({ success: note })
      .notif(`${note.title.ellipsis(10)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
