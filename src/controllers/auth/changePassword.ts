import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/manipulate/normalize";
import { sendCredentialChanges } from "../../utils/email/send";
import { User } from "../../models/User";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/class/Error";
import { updateById } from "@/services/crud/update";

export const changePassword = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { newPassword, password } = req.body;
    validateRequires(["newPassword", "password"], req.body);
    if (!user.email) {
      throw new AppError("NOT_BOUND");
    }
    if (user.password && !(await bcrypt.compare(password, user.password))) {
      throw new AppError("CLIENT_FIELD", { field: "password", message: "Old password is wrong" });
    }

    if (user.password && (await bcrypt.compare(newPassword, user.password))) {
      throw new AppError("CLIENT_FIELD", { field: "newPassword", message: "New password and old password can not same" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateById(User, user.id, { password: hashedPassword }, { project: userProject() });

    await sendCredentialChanges(user.email, user.fullName);
    res.body({ success: updatedUser }).info("Successfully update new password").ok();
  } catch (err) {
    handleError(err, res);
  }
};
