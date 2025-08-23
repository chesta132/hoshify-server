import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Database } from "@/class/Database";

export const deleteDummy = async <T extends { isRecycled: boolean }>(model: Database<T>, name: string, req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const dummys = await model.deleteMany({ userId: user.id, dummy: true });

    res
      .body({ success: dummys })
      .notif(`${dummys.deletedCount} ${name} ${dummys.deletedCount === 1 ? "dummy" : "dummys"} deleted`)
      .respond();
  } catch (err) {
    handleError(err, res);
  }
};
