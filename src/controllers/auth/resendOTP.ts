import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import { oneMin } from "../../utils/token";
import { IVerify, Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { userProject } from "../../utils/normalizeQuery";

type TypeOTP = "CHANGE_EMAIL" | "CHANGE_PASSWORD" | "DELETE_ACCOUNT";

export const resendOTP = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { type }: { type?: TypeOTP } = req.body;
    const otp = generateOTP();

    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      res.tempLimitSendEmail().respond();
      return;
    }

    const createAndSend = async (type: IVerify["type"]) => {
      await Verify.create({ value: otp, type, userId: user.id, deleteAt: new Date(Date.now() + oneMin * 2) });
      await sendOTPEmail(user.email || user.gmail!, otp, user.fullName);
      const updatedUser = await User.updateByIdAndNormalize(
        user.id,
        { timeToAllowSendEmail: new Date(Date.now() + 1000 * 60 * 2) },
        { project: userProject() }
      );
      res.body({ success: updatedUser }).created();
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
    }

    res.tempClientField("otp", "Invalid type please select a valid type").error();
  } catch (err) {
    handleError(err, res);
  }
};
