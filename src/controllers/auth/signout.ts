import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { CLIENT_URL } from "../../app";
import { verifyRefreshToken } from "../../utils/token";
import { Revoked } from "../../models/Revoked";

export const signout = async (req: Request, { res }: Response) => {
  const clearAndRedirect = () => res.clearCookie("accessToken").clearCookie("refreshToken").redirect(`${CLIENT_URL}/signin`);
  try {
    const user = req.user!;
    const { refreshToken } = req.cookies;
    const verifiedPayload = verifyRefreshToken(refreshToken);
    if (!verifiedPayload) {
      clearAndRedirect();
      return;
    }
    const expIn = new Date(verifiedPayload.exp! * 1000);

    await Revoked.create({ value: refreshToken, userId: user.id, deleteAt: expIn, type: "TOKEN" });

    clearAndRedirect();
  } catch (error) {
    handleError(error, res);
  }
};
