import { Response, Request, NextFunction } from "express";
import handleError from "../utils/handleError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { Revoked } from "../models/Revoked";
import { User, UserRole } from "../models/User";
import { Respond } from "@/class/Response";

const isRefreshSafe = async (refreshToken: string) => {
  const refreshPayload = verifyRefreshToken(refreshToken);

  if (!refreshPayload) return;
  const revoked = await Revoked.findOne({ value: refreshToken }).normalize();
  if (revoked) return;
  return { refreshPayload, revoked };
};

export const authMiddleware = async (req: Request, response: Response, next: NextFunction) => {
  const { res } = response;
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
      const user = await User.findById(refreshPayload.userId).normalize();
      if (!user) {
        res.tempInvalidToken().respond();
        return;
      }

      // Set new access token in cookie
      res.sendCookie({ template: "ACCESS", user });

      req.user = user;
      response.res = undefined as any;
      response.res = new Respond(req, response);
      return next();
    }

    const user = await User.findById(payload.userId).normalize();
    if (!user) {
      res.tempNotFound("user", "please back to dashboard or sign in page").respond();
      return;
    }

    // refresh token if payload is expires
    if (new Date(refreshPayload.expires) <= new Date()) {
      res.sendCookie({ template: "REFRESH_ACCESS", rememberMe: true, user });
    }

    req.user = user;
    response.res = undefined as any;
    response.res = new Respond(req, response);
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
