import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email/send";
import { oneMin } from "../../utils/token";
import { IVerify, Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { userProject } from "../../utils/manipulate/normalize";
import { AppError } from "@/class/Error";
import db from "@/services/crud";

type TypeOTP = "CHANGE_EMAIL" | "CHANGE_PASSWORD" | "DELETE_ACCOUNT";

export const resendOTP = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { type }: { type?: TypeOTP } = req.query;
    const otp = generateOTP();

    const createAndSend = async (type: IVerify["type"]) => {
      if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
        throw new AppError("EMAIL_LIMIT");
      }
      db.create(Verify, { value: otp, type, userId: user.id, deleteAt: new Date(Date.now() + oneMin * 2) });
      await sendOTPEmail(user.email || user.gmail!, otp, user.fullName);
      const updatedUser = db.updateById(User, user.id, { timeToAllowSendEmail: new Date(Date.now() + 1000 * 60 * 2) }, { project: userProject() });
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
    handleError(err, res);
  }
};
