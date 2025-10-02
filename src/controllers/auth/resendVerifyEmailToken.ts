import { NextFunction, Request, Response } from "express";
import { sendVerificationEmail } from "../../utils/email/send";
import { encrypt } from "../../utils/crypto";
import { AppError } from "@/services/error/Error";
import { Verify } from "@/services/db/Verify";
import { timeInMs } from "@/utils/manipulate/number";
import { omitCreds, User } from "@/services/db/User";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await Verify.create({
    data: { userId: user.id.toString(), value: token, type: "VERIFY_EMAIL", deleteAt: new Date(Date.now() + timeInMs({ minute: 5 })) },
  });
  await sendVerificationEmail(user.email?.toString()!, token, user.fullName.toString());
  return await User.updateById(user.id.toString(), {
    data: { timeToAllowSendEmail: new Date(Date.now() + timeInMs({ minute: 2 })) },
    omit: omitCreds(),
  });
};

export const resendVerifyEmail = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    if (!user.email) {
      throw new AppError("NOT_BOUND");
    }
    if (user.verified) {
      throw new AppError("IS_VERIFIED");
    }
    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      throw new AppError("EMAIL_LIMIT");
    }
    const updatedUser = await sendVerifyEmail(user);
    res.body({ success: updatedUser }).created();
  } catch (err) {
    next(err);
  }
};
