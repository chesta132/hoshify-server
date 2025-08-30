import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Link } from "@/models/Link";
import { validateIds } from "@/utils/validate";

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

    res.noContent();
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteLinks = async (req: Request, { res }: Response) => {
  try {
    const ids: any[] = req.body;
    if (!validateIds(ids, res)) return;

    await Link.deleteMany({ _id: { $in: ids } });

    res.noContent();
  } catch (err) {
    handleError(err, res);
  }
};
