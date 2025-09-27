import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/manipulate/normalize";
import { sendCredentialChanges } from "../../utils/email/send";
import { Verify } from "../../models/Verify";
import { User } from "../../models/User";
import { validateRequires } from "@/utils/validate";
import { ServerError } from "@/class/ServerError";
import db from "@/services/crud";

export const resetPassword = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const token = req.query.token?.toString();
    const { newPassword } = req.body;
    validateRequires(["newPassword"], req.body);
    validateRequires(["token"], req.query);
    if (!user.password || !user.email) {
      throw new ServerError("NOT_BOUND", {});
    }

    if (!user.verified) {
      throw new ServerError("CLIENT_FIELD", { message: "User email must be verified first", field: "newPassword" });
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ServerError("CLIENT_FIELD", { field: "newPassword", message: "New password and old password can not same" });
    }

    await db.getOne(Verify, { value: token, type: "RESET_PASSWORD_OTP", userId: user.id }, { error: { code: "INVALID_OTP" } });

    const updatedUser = await db.updateById(User, user.id, { password }, { project: userProject() });

    await db.deleteOne(Verify, { value: token, type: "RESET_PASSWORD_OTP", userId: user.id }, { error: null });
    await sendCredentialChanges(user.email, user.fullName);

    res.body({ success: updatedUser }).info("Successfully reset and update new password").ok();
  } catch (err) {
    handleError(err, res);
  }
};
