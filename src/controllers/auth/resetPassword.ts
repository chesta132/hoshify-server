import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { sendCredentialChanges } from "../../utils/email/send";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/services/error/AppError";
import { Verify } from "@/services/db/Verify";
import { omitCreds, User } from "@/services/db/User";

export const resetPassword = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const token = req.query.token?.toString();
    const { newPassword } = req.body;
    validateRequires(["newPassword"], req.body);
    validateRequires(["token"], req.query);
    if (!user.password || !user.email) {
      throw new AppError("NOT_BOUND");
    }

    if (!user.verified) {
      throw new AppError("CLIENT_FIELD", { message: "User email must be verified first", field: "newPassword" });
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password.toString())) {
      throw new AppError("CLIENT_FIELD", { field: "newPassword", message: "New password and old password can not same" });
    }

    const verif = await Verify.findFirst(
      { where: { value: token, type: "RESET_PASSWORD_OTP", userId: user.id.toString() } },
      { error: new AppError("INVALID_OTP") }
    );

    const updatedUser = await User.updateById(user.id.toString(), { data: { password }, omit: omitCreds() });

    await Verify.delete({ where: { id: verif.id } }, { error: null });
    await sendCredentialChanges(user.email.toString(), user.fullName.toString());

    res.body({ success: updatedUser }).info("Successfully reset and update new password").ok();
  } catch (err) {
    next(err);
  }
};
