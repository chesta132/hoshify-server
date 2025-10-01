import { Response, Request, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token";
import { Respond } from "@/services/respond/Respond";
import { AppError } from "@/services/error/Error";
import { Revoked } from "@/services/db/Revoked";
import { User } from "@/services/db/User";
import { UserRole } from "@prisma/client";

const isRefreshSafe = async (refreshToken: string) => {
  const refreshPayload = verifyRefreshToken(refreshToken);

  if (!refreshPayload) throw new AppError("INVALID_TOKEN");
  await Revoked.findFirst({ where: { value: refreshToken } }, { error: null });
  return refreshPayload;
};

export const authMiddleware = async (req: Request, response: Response, next: NextFunction) => {
  const { res } = response;
  try {
    const { refreshToken, accessToken } = req.cookies;

    // refresh token validation
    const refreshPayload = await isRefreshSafe(refreshToken);

    // access token validation
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await User.findById(refreshPayload.userId, {}, { error: new AppError("INVALID_TOKEN") });

      // Set new access token in cookie
      res.sendCookie({ template: "ACCESS", user });

      req.user = user;
      response.res = undefined as any;
      response.res = new Respond(req, response);
      return next();
    }

    const user = await User.findById(
      payload.userId,
      {},
      { error: new AppError("NOT_FOUND", { item: "user", desc: "Please back to dashboard or sign in page" }) }
    );

    // refresh token if payload is expires
    if (new Date(refreshPayload.expires) <= new Date()) {
      res.sendCookie({ template: "REFRESH_ACCESS", rememberMe: true, user });
    }

    req.user = user;
    response.res = undefined as any;
    response.res = new Respond(req, response);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireVerified = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    if (req.user?.verified) {
      if (req.user.verified) next();
      else throw new AppError("NOT_VERIFIED");
    } else {
      const { refreshToken } = req.cookies;
      const refreshPayload = await isRefreshSafe(refreshToken);

      if (refreshPayload.verified) next();
      else throw new AppError("NOT_VERIFIED");
    }
  } catch (err) {
    next(err);
  }
};

export const requireRole = (role: UserRole | UserRole[]) => {
  return async (req: Request, { res }: Response, next: NextFunction) => {
    try {
      const error = new AppError("INVALID_ROLE", { role: typeof role === "string" ? role : role.join(", ") });
      if (req.user?.role) {
        if (typeof role === "string" ? req.user.role === role : role.includes(req.user.role as UserRole)) {
          next();
        } else {
          throw error;
        }
      } else {
        const { refreshToken } = req.cookies;
        const refreshPayload = await isRefreshSafe(refreshToken);
        if (typeof role === "string" ? refreshPayload.role === role : role.includes(refreshPayload.role)) next();
        else throw error;
      }
    } catch (err) {
      next(err);
    }
  };
};
