import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { sendCredentialChanges } from "../../utils/email";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const changeEmail = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { token } = req.query;
    const { newEmail } = req.body;
    if (!newEmail) {
      res.tempMissingFields("new email").error();
      return;
    }

    if (!user.email) {
      res.tempNotBound().error();
      return;
    }
    if (user.email === newEmail) {
      res.tempClientField("newEmail", "New email and old email can not same").error();
      return;
    }
    if (await User.findOne({ email: newEmail })) {
      res.tempClientField("newEmail", "Email is already in use").error();
      return;
    }

    const updateEmail = async () => {
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        {
          email: newEmail,
          // verified comment: new email is auto verified because google mail always valid
          verified: user?.gmail === newEmail,
        },
        { projection: userProject() }
      ).normalize();
      if (!updatedUser) {
        res.tempNotFound("user").error();
        return;
      }
      return updatedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email, user.fullName, "email");
      res.body({ success: updatedUser }).notif("Local email successfully updated").ok();
      return;
    }

    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const VerifyOtp = await Verify.findOne({ value: token, type: "CHANGE_EMAIL_OTP", userId: user.id }).normalize();
    if (!VerifyOtp) {
      res.tempInvalidOTP().error();
      return;
    }

    const updatedUser = await updateEmail();
    await Verify.deleteOne({ value: token, type: "CHANGE_EMAIL_OTP", userId: user.id });
    await sendCredentialChanges(user.email, user.fullName, "email");

    res.body({ success: updatedUser }).notif("Local email successfully updated").ok();
  } catch (err) {
    handleError(err, res);
  }
};
