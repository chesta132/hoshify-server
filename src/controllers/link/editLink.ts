import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Link } from "@/models/Link";

export const editLink = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    let { title, link, position } = req.body;

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      {
        title,
        link,
        position,
      },
      { new: true, runValidators: true }
    ).normalize();
    if (!updatedLink) {
      res.tempNotFound("link").respond();
      return;
    }
    res
      .body({ success: updatedLink })
      .notif(`${updatedLink.title.ellipsis(30)} added`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
