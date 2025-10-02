import { Response, Request, NextFunction } from "express";
import passport from "passport";
import { normalizeUserQuery } from "../../utils/manipulate/normalize";
import { TUser } from "@/services/db/User";
import { CookieUserBase, ErrorResponseType } from "@/services/respond/types";

export const signin = async (req: Request, { res }: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/signin", failureFlash: true, session: false },
    (err: Error, user: TUser, info: ErrorResponseType | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user && info) {
        const { code, message, field, title } = info;
        res.body({ error: { code, message, field, title } }).error();
        return;
      }

      req.login(user, { session: false }, (err) => {
        const normalized = normalizeUserQuery(user);
        if (err) {
          return next(err);
        }
        const rememberMe: boolean = req.body.rememberMe;

        res
          .body({ success: normalized })
          .sendCookie({
            template: "REFRESH_ACCESS",
            rememberMe,
            user: normalized as CookieUserBase,
          })
          .ok();
      });
    }
  )(req, res, next);
};
