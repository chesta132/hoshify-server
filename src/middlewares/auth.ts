import { Response, Request, NextFunction } from "express";
import handleError from "../utils/handleError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { Revoked } from "../models/Revoked";
import { User } from "../models/User";

export const authMiddleware = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    // refresh token validation
    const refreshToken = req.cookies?.refreshToken;
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      res.tempInvalidToken().respond();
      return;
    }

    const blacklistedToken = await Revoked.findOne({ value: refreshToken });
    if (blacklistedToken) {
      res.tempInvalidToken().respond();
      return;
    }

    // access token validation
    const accessToken = req.cookies?.accessToken;
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await User.findById(refreshPayload.userId);
      if (!user) {
        res.tempInvalidToken().respond();
        return;
      }

      // Set new access token in cookie
      res.sendCookie({ template: "ACCESS", user });

      req.user = user;
      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.tempNotFound("user", "please back to dashboard or sign in page").respond();
      return;
    }

    // refresh token if payload is expires
    if (new Date(refreshPayload.expires) <= new Date()) {
      res.sendCookie({ template: "REFRESH_ACCESS", rememberMe: true, user });
    }

    req.user = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};

export const requireVerified = (req: Request, { res }: Response, next: NextFunction) => {
  if (req.user?.verified) next();
  else res.tempNotVerified().respond();
};
