import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/manipulate/normalize";
import { sendCredentialChanges } from "../../utils/email/send";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";
import { ServerError } from "@/class/ServerError";
import { updateById } from "@/services/crud/update";
import { getOne } from "@/services/crud/read";
import { deleteOne } from "@/services/crud/delete";

export const changeEmail = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const token = req.query.token?.toString();
    const { newEmail } = req.body;
    if (!newEmail) {
      throw new ServerError("MISSING_FIELDS", { fields: "new email" });
    }

    if (!user.email) {
      throw new ServerError("NOT_BOUND", {});
    }
    if (user.email === newEmail) {
      throw new ServerError("CLIENT_FIELD", { field: "newEmail", message: "New email and old email can not same" });
    }
    if (await User.findOne({ email: newEmail })) {
      throw new ServerError("CLIENT_FIELD", { field: "newEmail", message: "Email is already in use" });
    }

    const updateEmail = async () => {
      const updatedUser = await updateById(
        User,
        user.id,
        {
          email: newEmail,
          // verified comment: new email is auto verified because google mail always valid
          verified: user?.gmail === newEmail,
        },
        { project: userProject() }
      );
      return updatedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email, user.fullName, "email");
      res.body({ success: updatedUser }).info("Local email successfully updated").ok();
      return;
    }

    if (!token) {
      throw new ServerError("MISSING_FIELDS", { fields: "token" });
    }
    const verifyFilter = { value: token, type: "CHANGE_EMAIL_OTP", userId: user.id } as const;
    const verifyError = { error: { code: "INVALID_OTP" } } as const;

    await getOne(Verify, verifyFilter, verifyError);

    const updatedUser = await updateEmail();
    await deleteOne(Verify, verifyFilter, verifyError);
    await sendCredentialChanges(user.email, user.fullName, "email");

    res.body({ success: updatedUser }).info("Local email successfully updated").ok();
  } catch (err) {
    handleError(err, res);
  }
};
