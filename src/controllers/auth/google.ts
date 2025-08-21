import { Response, Request } from "express";
import { CLIENT_URL } from "../../app";

export const googleCallback = (req: Request, { res }: Response) => {
  const user = req.user!;
  res.sendCookie({ user, template: "REFRESH_ACCESS", rememberMe: true }).redirect(`${CLIENT_URL}/`);
};
