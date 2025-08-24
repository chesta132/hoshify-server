import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId } from "mongoose";
import { Database } from "@/class/Database";

export const getOne = async <T extends Record<string, any>>(model: Database<T>, name: string, req: Request, res: Response["res"]) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.tempClientType("Object ID").respond();
      return;
    }

    const data = await model.findByIdAndNormalize(id);
    if (!data) {
      res.tempNotFound(name);
      return;
    }

    res.body({ success: data }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
