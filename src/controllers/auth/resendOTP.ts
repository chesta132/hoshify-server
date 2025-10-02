import { NextFunction, Request, Response } from "express";
import { generateOTP, sendOTPEmail } from "../../utils/email/send";
import { AppError } from "@/services/error/AppError";
import { Verify } from "@/services/db/Verify";
import { VerifyType } from "@prisma/client";
import { omitCreds, User } from "@/services/db/User";
import { timeInMs } from "@/utils/manipulate/number";

type TypeOTP = "CHANGE_EMAIL" | "CHANGE_PASSWORD" | "DELETE_ACCOUNT";

export const resendOTP = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { type }: { type?: TypeOTP } = req.query;
    const otp = generateOTP();

    const createAndSend = async (type: VerifyType) => {
      if (typeof user.timeToAllowSendEmail === "object" && user.timeToAllowSendEmail > new Date()) {
        throw new AppError("EMAIL_LIMIT");
      }
      Verify.create({ data: { value: otp, type, userId: user.id.toString(), deleteAt: new Date(Date.now() + timeInMs({ minute: 2 })) } });
      await sendOTPEmail(user.email?.toString() || user.gmail?.toString()!, otp, user.fullName.toString());
      const updatedUser = User.updateById(user.id.toString(), {
        data: { timeToAllowSendEmail: new Date(Date.now() + timeInMs({ minute: 2 })) },
        omit: omitCreds(),
      });
      res.body({ success: updatedUser }).respond();
    };

    switch (type) {
      case "CHANGE_EMAIL":
        await createAndSend("CHANGE_EMAIL_OTP");
        return;
      case "CHANGE_PASSWORD":
        await createAndSend("RESET_PASSWORD_OTP");
        return;
      case "DELETE_ACCOUNT":
        await createAndSend("DELETE_ACCOUNT_OTP");
        return;
      default:
        throw new AppError("CLIENT_TYPE", { fields: "otp type", details: "Invalid OTP type. Please send a valid type" });
    }
  } catch (err) {
    next(err);
  }
};
