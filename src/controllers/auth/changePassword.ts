import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { userProject } from "../../utils/normalizeQuery";
import { resMissingFields, resNotBinded, resNotFound } from "../../utils/response";
import { ErrorRes, Res } from "../../class/Response";
import { sendCredentialChanges } from "../../utils/email";
import { User } from "../../models/User";

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newPassword, password } = req.body;
    if (!newPassword || !password) {
      resMissingFields(res, "new password, old password");
      return;
    }
    if (!user.email) {
      resNotBinded(res);
      return;
    }
    if (user.password && !(await bcrypt.compare(password, user.password))) {
      ErrorRes({ message: "Old password is wrong", code: "CLIENT_FIELD", field: "password" }).response(res);
      return;
    }

    if (user.password && (await bcrypt.compare(newPassword, user.password))) {
      ErrorRes({ message: "New password and old password can not same", code: "CLIENT_FIELD", field: "newPassword" }).response(res);
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.updateByIdAndSanitize(user.id, { password: hashedPassword }, { project: userProject() });
    if (!updatedUser) {
      resNotFound(res, "user");
      return;
    }
    await sendCredentialChanges(user.email, user.fullName);

    Res(res, updatedUser, { notif: "Successfully update new password" }).response();
  } catch (err) {
    handleError(err, res);
  }
};
