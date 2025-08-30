import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerTemplateOptions, Normalized } from "@/types/types";

export const getOne = <T extends Record<string, any>>(model: Model<T>, options?: Omit<ControllerTemplateOptions<T>, "funcInitiator">) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = (await model.findOne({ _id: id, userId: req.user!.id }).normalize()) as Normalized<T>;
      if (!data) {
        res.tempNotFound(model.getName()).respond();
        return;
      }
      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res.body({ success: data }).respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
