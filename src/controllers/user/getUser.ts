import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";

export const getUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const normalized = normalizeUserQuery(user);
    res.body({ success: normalized }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
