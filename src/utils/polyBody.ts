import { Request, Response } from "express";
import handleError from "@/utils/handleError";

export const polyBody = (fObject: (req: Request, res: Response) => any, fArray: (req: Request, res: Response) => any) => {
  return async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (Array.isArray(body)) return await fArray(req, res);
      else if (typeof body === "object") return await fObject(req, res);
      res.res.tempClientType("Invalid body. Body is not array or object").respond();
    } catch (err) {
      handleError(err, res.res);
    }
  };
};
