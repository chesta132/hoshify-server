import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { sendCredentialChanges } from "../../utils/email";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const changeEmail = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
      res.tempMissingFields("new email, otp").error();
      return;
    }

    if (!user.email) {
      res.tempNotBound().error();
      return;
    }
    if (user.email === newEmail) {
      res.tempClientField({ message: "New email and old email can not same", field: "newEmail" }).error();
      return;
    }
    if (await User.find({ email: newEmail })) {
      res.tempClientField({ message: "Email is already in use", field: "newEmail" }).error();
      return;
    }

    const updateEmail = async () => {
      const updatedUser = await User.updateByIdAndNormalize(
        user.id,
        {
          email: newEmail,
          // verified comment: new email is auto verified because google mail always valid
          verified: user?.gmail === newEmail,
        },
        { project: userProject() }
      );
      if (!updatedUser) {
        res.tempNotFound("user").error();
        return;
      }
      await Verify.deleteOne({ value: otp, type: "CHANGE_EMAIL_OTP", userId: user.id });
      return updatedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email, user.fullName, "email");
      res.body({ success: updatedUser }).notif("Local email successfully updated").ok();
      return;
    }

    const VerifyOtp = await Verify.findOne({ value: otp, type: "CHANGE_EMAIL_OTP", userId: user.id });
    if (!VerifyOtp) {
      res.tempInvalidOTP().error();
      return;
    }

    const updatedUser = await updateEmail();
    await sendCredentialChanges(user.email, user.fullName, "email");

    res.body({ success: updatedUser }).notif("Local email successfully updated").ok();
  } catch (err) {
    handleError(err, res);
  }
};
