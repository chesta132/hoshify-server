import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/normalizeQuery";
import { sendCredentialChanges } from "../../utils/email";
import { resInvalidOTP, resMissingFields, resNotBinded, resNotFound } from "../../utils/response";
import { ErrorRes, Res } from "../../class/Response";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newPassword, otp } = req.body;
    if (!newPassword || !otp) {
      resMissingFields(res, "New password, otp");
      return;
    }
    if (!user.password || !user.email) {
      resNotBinded(res);
      return;
    }

    if (!user.verified) {
      ErrorRes({ message: "User email must be verified first", code: "CLIENT_FIELD", field: "newPassword" }).response(res);
      return;
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      ErrorRes({ message: "New password and old password can not same", code: "CLIENT_FIELD", field: "newPassword" }).response(res);
      return;
    }

    const verifyOtp = await Verify.findOne({ value: otp, type: "RESET_PASSWORD_OTP", userId: user.id });
    if (!verifyOtp) {
      resInvalidOTP(res);
      return;
    }
    const updatedUser = await User.updateByIdAndSanitize(user.id, { password }, { project: userProject() });
    if (!updatedUser) {
      resNotFound(res, "user");
      return;
    }
    await Verify.deleteOne({ value: otp, type: "RESET_PASSWORD_OTP", userId: user.id });
    await sendCredentialChanges(user.email, user.fullName);

    Res(res, updatedUser, { notif: "Successfully reset and update new password" }).response();
  } catch (err) {
    handleError(err, res);
  }
};
