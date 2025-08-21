import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";

export const initiateUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const populatedUser = await user.populate(["links", "widgets"]);

    const normalized = normalizeUserQuery(populatedUser);
    res.body({ success: normalized }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
