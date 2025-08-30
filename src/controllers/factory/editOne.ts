import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerTemplateOptions, Normalized } from "@/types/types";
import { unEditableField, validateRequires } from "@/utils/database";
import { omit } from "@/utils/manipulate";

export const editOne = <T>(model: Model<T>, neededField?: string[], options?: ControllerTemplateOptions<T>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (neededField && !validateRequires(neededField, req.body, res)) return;

      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const data = (await model
        .findOneAndUpdate({ _id: id, userId: req.user!.id }, omit(req.body, unEditableField), { new: true, runValidators: true })
        .normalize()) as Normalized<T>;
      if (!data) {
        res.tempNotFound(model.getName()).respond();
        return;
      }
      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res
        .body({ success: data })
        .notif(`${(data as any).title || model.getName()}`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
