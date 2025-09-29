import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { normalizeCurrency, normalizeUserQuery } from "../../utils/manipulate/normalize";
import { buildUserPopulate, PopulatedUser, User } from "../../models/User";
import { Normalized } from "@/types";

export const initialPopulateConfig = {
  todos: 5,
  transactions: 5,
  notes: 5,
  links: 10,
  schedules: 5,
  money: "all",
} as const;

export const initiateUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;

    const populatedUser = (await User.findById(user.id).populate(buildUserPopulate(initialPopulateConfig)).normalize()) as Normalized<
      PopulatedUser<keyof typeof initialPopulateConfig>
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
