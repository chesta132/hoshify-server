import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Link } from "@/models/Link";
import { ellipsis } from "@/utils/manipulate";
import { validateIds } from "@/utils/database";
import pluralize from "pluralize";

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
      .body({ success: {} })
      .notif(`${ellipsis(deletedLink.title, 30)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteLinks = async (req: Request, { res }: Response) => {
  try {
    const ids: any[] = req.body;
    validateIds(ids, res);

    const deletedLink = await Link.deleteMany({ _id: { $in: ids } });

    res
      .body({ success: {} })
      .notif(`${deletedLink.deletedCount} ${pluralize("link", deletedLink.deletedCount)} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
