import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { isValidObjectId, Model } from "mongoose";
import { ControllerOptions, Normalized } from "@/types/types";
import { getOne } from "@/services/crud/read";

export const getOneFactory = <T extends Record<string, any>>(model: Model<T>, options?: Omit<ControllerOptions<T>, "funcInitiator">) => {
  return async (req: Request, { res }: Response) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.tempClientType("Object ID").respond();
        return;
      }

      const data = (await getOne<any, any>(model, { _id: id, userId: req.user!.id })) as Normalized<T>;

      if (options?.funcBeforeRes) await options.funcBeforeRes(data, req, res);

      res.body({ success: data }).respond();
    } catch (err) {
      handleError(err, res);
    }
  };
};
