import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerTemplateOptions } from "@/types/types";
import { ellipsis } from "@/utils/manipulate/string";

export const restoreOne = <T extends { isRecycled: boolean; title: string; deleteAt: Date | null }>(
  model: Model<T>,
  options?: ControllerTemplateOptions<T>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = (await model.restoreOne({ _id: id, userId: req.user!.id, isRecycled: true }))?.normalize();
      if (!data) {
        res.tempNotFound(model.getName()).respond();
        return;
      }
      if (!data.isRecycled) {
        await model.findByIdAndUpdate(data.id, data).normalize();
        res.tempNotRecycled(data.title).respond();
        return;
      }
      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res
        .body({ success: { ...data, isRecycled: false, deleteAt: null } })
        .info(`${ellipsis(data.title, 30)} restored`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
