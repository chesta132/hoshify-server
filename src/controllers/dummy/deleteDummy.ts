import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Model } from "mongoose";

export const deleteDummy = async <T extends { dummy: boolean }>(model: Model<T>, req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const dummys = await model.deleteMany({ userId: user.id, dummy: true });
    const name = model.getName();

    res
      .body({ success: dummys })
      .info(`${dummys.deletedCount} ${name} ${dummys.deletedCount === 1 ? "dummy" : "dummys"} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
