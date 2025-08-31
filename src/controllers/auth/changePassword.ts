import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/manipulate/normalize";
import { sendCredentialChanges } from "../../utils/email/send";
import { User } from "../../models/User";
import { validateRequires } from "@/utils/validate";

export const changePassword = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { newPassword, password } = req.body;
    if (!validateRequires(["newPassword", "password"], req.body, res)) return;
    if (!user.email) {
      res.tempNotBound().respond();
      return;
    }
    if (user.password && !(await bcrypt.compare(password, user.password))) {
      res.tempClientField("password", "Old password is wrong").respond();
      return;
    }

    if (user.password && (await bcrypt.compare(newPassword, user.password))) {
      res.tempClientField("newPassword", "New password and old password can not same").respond();
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(user.id, { password: hashedPassword }, { projection: userProject() }).normalize();
    if (!updatedUser) {
      res.tempNotFound("user").respond();
      return;
    }
    await sendCredentialChanges(user.email, user.fullName);
    res.body({ success: updatedUser }).info("Successfully update new password").ok();
  } catch (err) {
    handleError(err, res);
  }
};
