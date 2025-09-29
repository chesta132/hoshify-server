import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerConfig, ControllerOptions, Normalized } from "@/types";
import { unEditableField } from "@/utils/database/plugin";
import { omit, pick } from "@/utils/manipulate/object";
import { validateRequires } from "@/utils/validate";
import { updateOne } from "@/services/crud/update";

export const updateOneFactory = <T, F extends string>(
  model: Model<T>,
  { neededField, acceptableField }: ControllerConfig<T, F>,
  options?: ControllerOptions<T>
) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (neededField) validateRequires(neededField, req.body);
      req.body = pick(omit(req.body, unEditableField) as any, [...(neededField || []), ...(acceptableField || [])]);
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      if (options?.funcInitiator) if ((await options.funcInitiator(req, res)) === "stop") return;

      const data = (await updateOne(model, { _id: id, userId: req.user!.id, ...options?.filter }, req.body, {
        options: { new: true, runValidators: true },
        ...options?.settings,
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
