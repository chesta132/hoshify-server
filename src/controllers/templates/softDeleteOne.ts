import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Database } from "@/class/Database";

export const softDeleteOne = async <T extends { isRecycled: boolean; title: string }>(model: Database<T>, req: Request, res: Response["res"]) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const data = await model.softDeleteById(id, undefined, { options: { new: true, runValidators: true } });
    if (!data) {
      res.tempNotFound(model.collection.name.plural());
      return;
    }

    res.body({ success: data }).notif(`${data.title.ellipsis(10)} deleted`);
  } catch (err) {
    handleError(err, res);
  }
};
