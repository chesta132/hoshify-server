import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Note } from "@/models/Note";

export const createNote = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details } = req.body;
    if (!title || !details) {
      res.tempMissingFields("title, details").respond();
      return;
    }

    const note = await Note.createAndNormalize({
      title,
      details,
      userId: user.id,
    });
    res
      .body({ success: note })
      .notif(`${note.title.ellipsis(10)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
