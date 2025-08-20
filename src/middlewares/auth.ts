import { Response, Request, NextFunction } from "express";
import handleError from "../utils/handleError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { resInvalidToken, resNotFound, resNotVerified } from "../utils/response";
import { Revoked } from "../models/Revoked";
import { User } from "../models/User";
import { Res } from "../class/Response";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // refresh token validation
    const refreshToken = req.cookies?.refreshToken;
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      resInvalidToken(res);
      return;
    }

    const blacklistedToken = await Revoked.findOne({ value: refreshToken });
    if (blacklistedToken) {
      resInvalidToken(res);
      return;
    }

    // access token validation
    const accessToken = req.cookies?.accessToken;
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await User.findById(refreshPayload.userId);
      if (!user) {
        resInvalidToken(res);
        return;
      }

      // Set new access token in cookie
      Res(res, undefined, { cookie: { user, template: "ACCESS" } }).sendCookie();

      req.user = user;
      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      resNotFound(res, "user", "please back to dashboard or sign in page");
      return;
    }

    // refresh token if payload is expires
    if (new Date(refreshPayload.expires) <= new Date()) {
      Res(res, user, { cookie: { template: "REFRESH_ACCESS", rememberMe: true } }).sendCookie();
    }

    req.user = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};

export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.verified) next();
  else resNotVerified(res);
};
