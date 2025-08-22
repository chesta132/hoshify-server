import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { sendVerificationEmail } from "../../utils/email";
import { encrypt } from "../../utils/crypto";
import { fiveMin, oneMin } from "../../utils/token";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { userProject } from "../../utils/normalizeQuery";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await Verify.create({ userId: user.id, value: token, type: "VERIFY_EMAIL", deleteAt: new Date(Date.now() + fiveMin) });
  await sendVerificationEmail(user.email!, token, user.fullName);
  return await User.updateByIdAndSanitize(user.id, { timeToAllowSendEmail: new Date(Date.now() + oneMin * 2) }, { project: userProject() });
};

export const resendVerifyEmail = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    if (!user.email) {
      res.tempNotBound().respond();
      return;
    }
    if (user.verified) {
      res.tempIsVerified().respond();
      return;
    }
    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      res.tempLimitSendEmail().respond();
      return;
    }
    const updatedUser = await sendVerifyEmail(user);
    res.body({ success: updatedUser }).created();
  } catch (err) {
    handleError(err, res);
  }
};
