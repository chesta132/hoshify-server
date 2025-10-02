import { Response, Request, NextFunction } from "express";
import { verifyRefreshToken } from "../../utils/token";
import { Revoked } from "@/services/db/Revoked";
import { CLIENT_URL } from "@/config";

export const signout = async (req: Request, { res }: Response, next: NextFunction) => {
  const clearAndRedirect = () => res.deleteCookies(["accessToken", "refreshToken"]).redirect(`${CLIENT_URL}/signin`);
  try {
    const user = req.user!;
    const { refreshToken } = req.cookies;
    const verifiedPayload = verifyRefreshToken(refreshToken);
    if (!verifiedPayload) {
      clearAndRedirect();
      return;
    }
    const expIn = new Date(verifiedPayload.exp! * 1000);

    await Revoked.create({ data: { value: refreshToken, userId: user.id.toString(), deleteAt: expIn, type: "TOKEN" } });

    clearAndRedirect();
  } catch (error) {
    next(error);
  }
};
