import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { User } from "../../models/User";

export const initiateUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const populatedUser = await User.findByIdAndNormalize(user.id, { populate: ["links", "widgets"] });
    if (!populatedUser) {
      res.tempNotFound("user");
      return;
    }

    const normalized = normalizeUserQuery(populatedUser);
    res.body({ success: normalized }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
