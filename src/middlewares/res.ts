import { Response, Request, NextFunction } from "express";
import { Respond } from "../services/respond/Respond";

export const resMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.res = new Respond(req, res);
  next();
};
