import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { Res } from "../../class/Response";

export const initiateUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const populatedUser = await user.populate(["links", "widgets"]);

    const normalized = normalizeUserQuery(populatedUser);
    Res(res, normalized).response();
  } catch (err) {
    handleError(err, res);
  }
};
