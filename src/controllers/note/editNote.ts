import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Note } from "@/models/Note";
import { isValidObjectId } from "mongoose";

export const editNote = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    const { title, details } = req.body;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const note = await Note.findByIdAndUpdate(id, { title, details }, { new: true, runValidators: true }).normalize();
    if (!note) {
      res.tempNotFound("note");
      return;
    }

    res.body({ success: note }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
