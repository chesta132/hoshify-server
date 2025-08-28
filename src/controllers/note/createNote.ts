import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Note } from "@/models/Note";
import { ellipsis } from "@/utils/manipulate";

export const createNote = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { title, details } = req.body;
    if (!title || !details) {
      res.tempMissingFields("title, details").respond();
      return;
    }

    const note = await Note.create({
      title,
      details,
      userId: user.id,
    });
    res
      .body({ success: note })
      .notif(`${ellipsis(note.title, 30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
