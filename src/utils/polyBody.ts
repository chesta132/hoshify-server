import { AppError } from "@/class/Error";
import { NextFunction, Request, Response } from "express";

export const polyBody = (fObject: (req: Request, res: Response) => any, fArray: (req: Request, res: Response) => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      if (Array.isArray(body)) return await fArray(req, res);
      else if (typeof body === "object") return await fObject(req, res);
      throw new AppError("CLIENT_TYPE", { fields: "body", details: "Body is not array or object." });
    } catch (err) {
      next(err);
    }
  };
};
