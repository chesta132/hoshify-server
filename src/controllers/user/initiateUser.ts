import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeCurrency, normalizeUserQuery } from "../../utils/manipulate/normalize";
import { buildUserPopulate, BuildUserPopulateProps, PopulatedUser, User } from "../../models/User";
import { Normalized } from "@/types/types";

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

    const populatedUser = (await User.findById(user.id).populate(buildUserPopulate(populateConfig)).normalize()) as Normalized<
      PopulatedUser<keyof typeof populateConfig>
    >;
    if (!populatedUser) {
      res.tempNotFound("user");
      return;
    }
    (populatedUser.money as any) = normalizeCurrency(populatedUser.money, user.currency);
    (populatedUser.transactions as any) = normalizeCurrency(populatedUser.transactions, user.currency);

    const normalized = normalizeUserQuery(populatedUser);
    res.body({ success: normalized }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
