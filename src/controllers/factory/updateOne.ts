import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerOptions, Normalized } from "@/types/types";
import { unEditableField } from "@/utils/database/plugin";
import { omit } from "@/utils/manipulate/object";
import { validateRequires } from "@/utils/validate";
import { updateOne } from "@/services/crud/update";

export const updateOneFactory = <T>(model: Model<T>, neededField?: string[], options?: ControllerOptions<T>) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (neededField && !validateRequires(neededField, req.body, res)) return;

      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const data = (await updateOne(model, { _id: id, userId: req.user!.id }, omit(req.body, unEditableField), {
        options: { new: true, runValidators: true },
      })) as Normalized<T>;

      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res
        .body({ success: data })
        .info(`${(data as any).title || model.getName()}`)
        .respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
