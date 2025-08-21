import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import handleError from "../../utils/handleError";
import { CLIENT_URL } from "../../app";
import { verifyRefreshToken } from "../../utils/token";
import { Revoked } from "../../models/Revoked";

export const clearCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

export const signout = async (req: Request, { res }: Response) => {
  const redirect = () => res.redirect(`${CLIENT_URL}/signin`);
  try {
    const user = req.user!;
    const { refreshToken } = req.cookies;
    const verifiedPayload = verifyRefreshToken(refreshToken) as jwt.JwtPayload | null;
    if (!verifiedPayload) {
      clearCookies(res);
      redirect();
      return;
    }
    const expIn = new Date(verifiedPayload.exp! * 1000);

    await Revoked.create({ value: refreshToken, userId: user.id, deleteAt: expIn, type: "TOKEN" });

    clearCookies(res);
    redirect();
  } catch (error) {
    handleError(error, res);
  }
};
