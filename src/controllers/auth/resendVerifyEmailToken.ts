import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { sendVerificationEmail } from "../../utils/email";
import { encrypt } from "../../utils/crypto";
import { oneMin } from "../../utils/token";
import { resIsVerified, resNotBinded, resTooMuchRequest } from "../../utils/response";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { userProject } from "../../utils/normalizeQuery";
import { Res } from "../../class/Response";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await Verify.create({ userId: user.id, value: token, type: "VERIFY_EMAIL", deleteAt: new Date(Date.now() + oneMin * 2) });
  await sendVerificationEmail(user.email!, token, user.fullName);
  return await User.updateByIdAndSanitize(user.id, { timeToAllowSendEmail: new Date(Date.now() + 1000 * 60 * 2) }, { project: userProject() });
};

export const resendVerifyEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.email) {
      resNotBinded(res);
      return;
    }
    if (user.verified) {
      resIsVerified(res);
      return;
    }
    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      resTooMuchRequest(res, "please request to send mail again later");
      return;
    }
    const updatedUser = await sendVerifyEmail(user);
    Res(res, updatedUser).created();
  } catch (err) {
    handleError(err, res);
  }
};
