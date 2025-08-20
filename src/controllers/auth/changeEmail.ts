import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { resInvalidOTP, resMissingFields, resNotBinded, resNotFound } from "../../utils/response";
import { ErrorRes, Res } from "../../class/Response";
import { sendCredentialChanges } from "../../utils/email";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
      return resMissingFields(res, "new email, otp");
    }

    if (!user.email) {
      return resNotBinded(res);
    }
    if (user.email === newEmail) {
      ErrorRes({ message: "New email and old email can not same", code: "CLIENT_FIELD", field: "newEmail" }).response(res);
      return;
    }
    if (await User.find({ email: newEmail })) {
      ErrorRes({ message: "Email is already in use", code: "CLIENT_FIELD", field: "newEmail" }).response(res);
      return;
    }

    const updateEmail = async () => {
      const updatedUser = await User.updateByIdAndSanitize(
        user.id,
        {
          email: newEmail,
          // verified comment: new email is auto verified because google mail always valid
          verified: user?.gmail === newEmail,
        },
        { project: userProject() }
      );
      if (!updatedUser) {
        resNotFound(res, "user");
        return;
      }
      await Verify.deleteOne({ value: otp, type: "CHANGE_EMAIL_OTP", userId: user.id });
      return updatedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email, user.fullName, "email");
      Res(res, updatedUser, { notif: "Local email successfully updated" }).response();
      return;
    }

    const VerifyOtp = await Verify.findOne({ value: otp, type: "CHANGE_EMAIL_OTP", userId: user.id });
    if (!VerifyOtp) {
      resInvalidOTP(res);
      return;
    }

    const updatedUser = await updateEmail();
    await sendCredentialChanges(user.email, user.fullName, "email");

    Res(res, updatedUser, { notif: "Local email successfully updated" }).response();
  } catch (err) {
    handleError(err, res);
  }
};
