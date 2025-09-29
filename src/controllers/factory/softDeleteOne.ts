import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerOptions } from "@/types";
import { ellipsis } from "@/utils/manipulate/string";
import { getDeleteTTL } from "@/utils/database/plugin";
import db, { Settings } from "@/services/crud";

export const softDeleteOneFactory = <T extends { isRecycled: boolean; title: string; deleteAt: Date | null }>(
  model: Model<T>,
  options?: ControllerOptions<T>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = await db.softDeleteOne<T, Settings<T>>(
        { _id: id, userId: req.user!.id, isRecycled: false, ...options?.filter } as any,
        {},
        options?.settings
      );
      const deleteAt = getDeleteTTL();
      if (!data) {
        res.tempNotFound(model.getName()).respond();
        return;
      }
      if (data.isRecycled) {
        await model.findByIdAndUpdate(data.id, data).normalize();
        res.tempIsRecycled(data.title).respond();
        return;
      }
      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res
        .body({ success: { ...data, isRecycled: true, deleteAt } })
        .info(`${ellipsis(data.title, 30)} deleted`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
