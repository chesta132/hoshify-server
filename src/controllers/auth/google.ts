import { Response, Request } from "express";
import { CLIENT_URL } from "../../app";
import { Res } from "../../class/Response";

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user!;
  Res(res, undefined, { cookie: { user, template: "REFRESH_ACCESS", rememberMe: true } })
    .sendCookie()
    .redirect(`${CLIENT_URL}/`);
};
