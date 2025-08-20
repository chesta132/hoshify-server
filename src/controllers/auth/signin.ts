import { Response, Request, NextFunction } from "express";
import passport from "passport";
import { ErrorRes, ErrorResponseType, Res } from "../../class/Response";
import handleError from "../../utils/handleError";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { IUser } from "../../models/User";

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/signin", failureFlash: true, session: false },
    (err: Error, user: IUser, info: ErrorResponseType | undefined) => {
      if (err) {
        return handleError(err, res);
      }
      if (!user && info) {
        const { code, message, field, title } = info;
        ErrorRes({ code, message, field, title }).response(res);
        return;
      }

      req.login(user, { session: false }, (err) => {
        const normalized = normalizeUserQuery(user);
        if (err) {
          return handleError(err, res);
        }
        const rememberMe: boolean = req.body.rememberMe;

        Res(res, normalized, { cookie: { template: "REFRESH_ACCESS", rememberMe } })
          .sendCookie()
          .response();
      });
    }
  )(req, res, next);
};
