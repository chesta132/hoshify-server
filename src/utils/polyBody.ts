import { AppError } from "@/services/error/AppError";
import { NextFunction, Request, RequestHandler, Response } from "express";

export const polyBody = (fObject: RequestHandler, fArray: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      if (Array.isArray(body)) return await fArray(req, res, next);
      else if (typeof body === "object") return await fObject(req, res, next);
      throw new AppError("CLIENT_TYPE", { fields: "body", details: "Body is not array or object." });
    } catch (err) {
      next(err);
    }
  };
};
