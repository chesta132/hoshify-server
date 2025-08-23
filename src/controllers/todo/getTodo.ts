import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Todo } from "@/models/Todo";
import { isValidObjectId } from "mongoose";

export const getTodo = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Id").respond();
      return;
    }

    const todo = await Todo.findByIdAndNormalize(id);
    if (!todo) {
      res.tempNotFound("to-do");
      return;
    }

    res.body({ success: todo }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
