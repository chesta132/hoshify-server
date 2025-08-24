import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Note } from "@/models/Note";
import { isValidObjectId } from "mongoose";

export const deleteNote = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const note = await Note.softDeleteById(id, {}, { options: { new: true, runValidators: true } });
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
