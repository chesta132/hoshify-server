import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { sendVerificationEmail } from "../../utils/email/send";
import { encrypt } from "../../utils/crypto";
import { fiveMin, oneMin } from "../../utils/token";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { userProject } from "../../utils/manipulate/normalize";
import { ErrorTemplate } from "@/class/ErrorTemplate";
import db from "@/services/crud";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await db.create(Verify, { userId: user.id, value: token, type: "VERIFY_EMAIL", deleteAt: new Date(Date.now() + fiveMin) });
  await sendVerificationEmail(user.email!, token, user.fullName);
  return await db.updateById(User, user.id, { timeToAllowSendEmail: new Date(Date.now() + oneMin * 2) }, { project: userProject() });
};

export const resendVerifyEmail = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    if (!user.email) {
      throw new ErrorTemplate("NOT_BOUND", {});
    }
    if (user.verified) {
      throw new ErrorTemplate("IS_VERIFIED", {});
    }
    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      throw new ErrorTemplate("EMAIL_LIMIT", {});
    }
    const updatedUser = await sendVerifyEmail(user);
    res.body({ success: updatedUser }).created();
  } catch (err) {
    handleError(err, res);
  }
};
