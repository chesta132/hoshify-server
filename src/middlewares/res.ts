import { Response, Request, NextFunction } from "express";
import { Respond } from "../class/Response";

export const resMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.res = new Respond(res);
  next();
};
