import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { sendCredentialChanges } from "../../utils/email/send";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/services/error/AppError";
import { omitCreds, User } from "@/services/db/User";

export const changePassword = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { newPassword, password } = req.body;
    validateRequires(["newPassword", "password"], req.body);
    if (!user.email) {
      throw new AppError("NOT_BOUND");
    }
    if (user.password && !(await bcrypt.compare(password, user.password.toString()))) {
      throw new AppError("CLIENT_FIELD", { field: "password", message: "Old password is wrong" });
    }

    if (user.password && (await bcrypt.compare(newPassword, user.password.toString()))) {
      throw new AppError("CLIENT_FIELD", { field: "newPassword", message: "New password and old password can not same" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.updateById(user.id.toString(), { data: { password: hashedPassword }, omit: omitCreds() });

    await sendCredentialChanges(user.email.toString(), user.fullName.toString());
    res.body({ success: updatedUser }).info("Successfully update new password").ok();
  } catch (err) {
    next(err);
  }
};
