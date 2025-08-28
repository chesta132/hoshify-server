import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { buildUserPopulate, BuildUserPopulateProps, User } from "../../models/User";

export const initiateUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const populateConfig: BuildUserPopulateProps = {
      todos: 5,
      transactions: 5,
      notes: 3,
      links: "all",
      schedules: 3,
      money: "all",
    };

    const populatedUser = await User.findById(user.id).populate(buildUserPopulate(populateConfig)).normalize();
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
