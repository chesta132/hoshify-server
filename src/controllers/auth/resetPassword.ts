import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/normalizeQuery";
import { sendCredentialChanges } from "../../utils/email";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";

export const resetPassword = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { newPassword, otp } = req.body;
    if (!newPassword || !otp) {
      res.tempMissingFields("New password, otp").respond();
      return;
    }
    if (!user.password || !user.email) {
      res.tempNotBound().respond();
      return;
    }

    if (!user.verified) {
      res.tempClientField("newPassword", "User email must be verified first").error();
      return;
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      res.tempClientField("newPassword", "New password and old password can not same").error();
      return;
    }

    const verifyOtp = await Verify.findOne({ value: otp, type: "RESET_PASSWORD_OTP", userId: user.id });
    if (!verifyOtp) {
      res.tempInvalidOTP().respond();
      return;
    }
    const updatedUser = await User.updateByIdAndNormalize(user.id, { password }, { project: userProject() });
    if (!updatedUser) {
      res.tempNotFound("user").respond();
      return;
    }
    await Verify.deleteOne({ value: otp, type: "RESET_PASSWORD_OTP", userId: user.id });
    await sendCredentialChanges(user.email, user.fullName);

    res.body({ success: updatedUser }).notif("Successfully reset and update new password").ok();
  } catch (err) {
    handleError(err, res);
  }
};
