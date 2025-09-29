import { Response, Request, NextFunction } from "express";
import passport from "passport";
import { ErrorResponseType } from "../../class/Response";
import handleError from "../../utils/handleError";
import { normalizeCurrency, normalizeUserQuery } from "../../utils/manipulate/normalize";
import { IUser, UserPopulateField } from "../../models/User";
import { NormalizedData } from "../../types";

export const signin = async (req: Request, { res }: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/signin", failureFlash: true, session: false },
    (err: Error, user: NormalizedData<IUser & UserPopulateField>, info: ErrorResponseType | undefined) => {
      if (err) {
        return handleError(err, res);
      }
      if (!user && info) {
        const { code, message, field, title } = info;
        res.body({ error: { code, message, field, title } }).error();
        return;
      }

      req.login(user, { session: false }, (err) => {
        const normalized = normalizeUserQuery(user);
        (normalized.money as any) = normalizeCurrency(normalized.money, user.currency);
        (normalized.transactions as any) = normalizeCurrency(normalized.transactions, user.currency);
        if (err) {
          return handleError(err, res);
        }
        const rememberMe: boolean = req.body.rememberMe;

        res.body({ success: normalized }).sendCookie({ template: "REFRESH_ACCESS", rememberMe }).ok();
      });
    }
  )(req, res, next);
};
