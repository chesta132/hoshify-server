import { Response, Request, NextFunction } from "express";
import { normalizeUserQuery } from "../../utils/manipulate/normalize";

export const getUser = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const normalized = normalizeUserQuery(user);
    res.body({ success: normalized }).ok();
  } catch (err) {
    next(err);
  }
};
