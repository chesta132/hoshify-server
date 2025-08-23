import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Note } from "@/models/Note";
import { isValidObjectId } from "mongoose";

export const getNote = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Id").respond();
      return;
    }

    const note = await Note.findByIdAndNormalize(id);
    if (!note) {
      res.tempNotFound("note");
      return;
    }

    res.body({ success: note }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
