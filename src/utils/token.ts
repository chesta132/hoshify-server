import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { NODE_ENV } from "../app";

export const oneWeeks = 7 * 24 * 60 * 60 * 1000;
export const oneMin = 1 * 60 * 1000;
export const fiveMin = oneMin * 5;

export const resAccessToken: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: fiveMin,
};

export const resRefreshToken: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: oneWeeks * 2,
};

export const resRefreshTokenSessionOnly: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
};

export interface JWTPayload {
  userId: string;
  expires: Date;
  verified: boolean;
}

export const createAccessToken = (payload: JWTPayload, expiresIn?: StringValue | number | null) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, expiresIn !== null ? { expiresIn: "5m" } : {});
};

export const createRefreshToken = (payload: JWTPayload, expiresIn?: StringValue | number | null) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, expiresIn !== null ? { expiresIn: "2w" } : {});
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
