import { NextFunction, Request, Response } from "express";
import { sendCredentialChanges } from "../../utils/email/send";
import { AppError } from "@/services/error/Error";
import { omitCreds, User } from "@/services/db/User";
import { Verify } from "@/services/db/Verify";

export const changeEmail = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const token = req.query.token?.toString();
    const { newEmail } = req.body;
    if (!newEmail) {
      throw new AppError("MISSING_FIELDS", { fields: "newEmail" });
    }

    if (!user.email) {
      throw new AppError("NOT_BOUND");
    }
    if (user.email === newEmail) {
      throw new AppError("CLIENT_FIELD", { field: "newEmail", message: "New email and old email can not same" });
    }
    const emailCandidate = await User.findFirst({ where: { email: newEmail } }, { error: null });
    if (emailCandidate) {
      throw new AppError("CLIENT_FIELD", { field: "newEmail", message: "Email is already in use" });
    }

    const updateEmail = async () => {
      const updatedUser = await User.updateById(user.id.toString(), {
        data: {
          email: newEmail,
          // verified comment: new email is auto verified because google mail always valid
          verified: user?.gmail === newEmail,
        },
        omit: omitCreds(),
      });
      return updatedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email.toString(), user.fullName.toString(), "email");
      res.body({ success: updatedUser }).info("Local email successfully updated").ok();
      return;
    }

    if (!token) {
      throw new AppError("MISSING_FIELDS", { fields: "token" });
    }
    const verifyFilter = { value: token, type: "CHANGE_EMAIL_OTP", userId: user.id.toString() } as const;
    const verifyError = { error: new AppError("INVALID_OTP") };

    const verif = await Verify.findFirst({ where: verifyFilter }, verifyError);

    const updatedUser = await updateEmail();
    await Verify.delete({ where: { id: verif.id } }, verifyError);
    await sendCredentialChanges(user.email.toString(), user.fullName.toString(), "email");

    res.body({ success: updatedUser }).info("Local email successfully updated").ok();
  } catch (err) {
    next(err);
  }
};
