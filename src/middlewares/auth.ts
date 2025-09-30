import { Response, Request, NextFunction } from "express";
import handleError from "../utils/handleError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { Revoked } from "../models/Revoked";
import { User, UserRole } from "../models/User";
import { Respond } from "@/class/Response";
import db from "@/services/crud";
import { ServerError } from "@/class/Error";

const isRefreshSafe = async (refreshToken: string) => {
  const refreshPayload = verifyRefreshToken(refreshToken);

  if (!refreshPayload) throw new ServerError("INVALID_TOKEN", {});
  await db.getOne(Revoked, { value: refreshToken }, { error: null });
  return { refreshPayload };
};

export const authMiddleware = async (req: Request, response: Response, next: NextFunction) => {
  const { res } = response;
  try {
    const { refreshToken, accessToken } = req.cookies;

    // refresh token validation
    const { refreshPayload } = await isRefreshSafe(refreshToken);

    // access token validation
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await db.getById(User, refreshPayload.userId, { error: { code: "INVALID_TOKEN" } });

      // Set new access token in cookie
      res.sendCookie({ template: "ACCESS", user });

      req.user = user;
      response.res = undefined as any;
      response.res = new Respond(req, response);
      return next();
    }

    const user = await db.getById(User, payload.userId, {
      error: { code: "NOT_FOUND", item: "user", desc: "please back to dashboard or sign in page" },
    });

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
  try {
    if (req.user?.verified) {
      if (req.user.verified) next();
      else throw new ServerError("NOT_VERIFIED", {});
    } else {
      const { refreshToken } = req.cookies;
      const { refreshPayload } = await isRefreshSafe(refreshToken);

      if (refreshPayload.verified) next();
      else res.tempNotVerified().respond();
    }
  } catch (err) {
    handleError(err, res);
  }
};

export const requireRole = (role: UserRole | UserRole[]) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const error = new ServerError("INVALID_ROLE", { role: typeof role === "string" ? role : role.join(", ") });
      if (req.user?.role) {
        if (typeof role === "string" ? req.user.role === role : role.includes(req.user.role)) {
          next();
        } else {
          throw error;
        }
      } else {
        const { refreshToken } = req.cookies;
        const { refreshPayload } = await isRefreshSafe(refreshToken);
        if (typeof role === "string" ? refreshPayload.role === role : role.includes(refreshPayload.role)) next();
        else throw error;
      }
    } catch (err) {
      handleError(err, res);
    }
  };
};
