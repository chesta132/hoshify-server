import { Response, Request, NextFunction } from "express";
import handleError from "../utils/handleError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { Revoked } from "../models/Revoked";
import { User, UserRole } from "../models/User";

const isRefreshSafe = async (refreshToken: string) => {
  const refreshPayload = verifyRefreshToken(refreshToken);

  if (!refreshPayload) return;
  const blacklistedToken = await Revoked.findOne({ value: refreshToken });
  if (blacklistedToken) return;
  return { refreshPayload, blacklistedToken };
};

export const authMiddleware = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const { refreshToken, accessToken } = req.cookies;

    // refresh token validation
    const isRSafe = await isRefreshSafe(refreshToken);
    if (!isRSafe) {
      res.tempInvalidToken().respond();
      return;
    }
    const { refreshPayload } = isRSafe;

    // access token validation
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await User.findByIdAndNormalize(refreshPayload.userId);
      if (!user) {
        res.tempInvalidToken().respond();
        return;
      }

      // Set new access token in cookie
      res.sendCookie({ template: "ACCESS", user });

      req.user = user;
      return next();
    }

    const user = await User.findByIdAndNormalize(payload.userId);
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

export const requireVerified = async (req: Request, { res }: Response, next: NextFunction) => {
  if (req.user?.verified) {
    if (req.user.verified) next();
    else res.tempNotVerified().respond();
  } else {
    const { refreshToken } = req.cookies;
    const isRSafe = await isRefreshSafe(refreshToken);
    if (!isRSafe) {
      res.tempInvalidToken().respond();
      return;
    }
    const { refreshPayload } = isRSafe;

    if (refreshPayload.verified) next();
    else res.tempNotVerified().respond();
  }
};

export const requireRole = (role: UserRole | UserRole[]) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    if (req.user?.role) {
      if (typeof role === "string" ? req.user.role === role : role.includes(req.user.role)) next();
      else res.tempInvalidRole(typeof role === "string" ? role : role.join(", ")).respond();
    } else {
      const { refreshToken } = req.cookies;
      const isRSafe = await isRefreshSafe(refreshToken);
      if (!isRSafe) {
        res.tempInvalidToken().respond();
        return;
      }
      const { refreshPayload } = isRSafe;

      if (typeof role === "string" ? refreshPayload.role === role : role.includes(refreshPayload.role)) next();
      else res.tempInvalidRole(typeof role === "string" ? role : role.join(", ")).respond();
    }
  };
};
