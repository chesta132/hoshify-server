import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Link } from "@/models/Link";

export const deleteLink = async (req: Request, { res }: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const deletedLink = await Link.findByIdAndDelete(id);
    if (!deletedLink) {
      res.tempNotFound("link").respond();
      return;
    }

    res
      .body({ success: deletedLink })
      .notif(`${deletedLink.title.ellipsis(30)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
