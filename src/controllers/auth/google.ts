import { CLIENT_URL } from "@/config";
import { Response, Request } from "express";

export const googleCallback = (req: Request, { res }: Response) => {
  res.sendCookie({ user: req.user as any, template: "REFRESH_ACCESS", rememberMe: true }).redirect(`${CLIENT_URL}/`);
};
