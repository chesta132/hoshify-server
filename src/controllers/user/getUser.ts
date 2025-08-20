import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { Res } from "../../class/Response";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const normalized = normalizeUserQuery(user);
    Res(res, normalized).response();
  } catch (err) {
    handleError(err, res);
  }
};
