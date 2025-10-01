import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { NODE_ENV } from "@/config";
import { timeInMs } from "./manipulate/number";

export const resAccessToken: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: timeInMs({ minute: 5 }),
};

export const resRefreshToken: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: timeInMs({ week: 2 }),
};

export const resRefreshTokenSessionOnly: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
};

export const createAccessToken = (payload: jwt.JwtPayload, expiresIn?: StringValue | number | null) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, expiresIn !== null ? { expiresIn: "5m" } : {});
};

export const createRefreshToken = (payload: jwt.JwtPayload, expiresIn?: StringValue | number | null) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, expiresIn !== null ? { expiresIn: "2w" } : {});
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};
