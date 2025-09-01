import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/manipulate/normalize";
import { decrypt } from "../../utils/crypto";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";
import { ErrorTemplate } from "@/class/ErrorTemplate";
import db from "@/services/crud";

export const verifyEmail = async (req: Request, { res }: Response) => {
  try {
    const token = req.query.token?.toString();
    if (!token) {
      throw new ErrorTemplate("MISSING_FIELDS", { fields: "token" });
    }

    const tokenDecrypted = decrypt(token?.toString());
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await db.getById(User, userId, { error: { code: "INVALID_VERIF_TOKEN" } });
    if (user.verified) {
      throw new ErrorTemplate("IS_VERIFIED", {});
    }

    await db.getOne(Verify, { value: token, type: "VERIFY_EMAIL", userId: user.id }, { error: { code: "INVALID_VERIF_TOKEN" } });

    const updatedUser = await db.updateById(
      User,
      user.id,
      { verified: true },
      { project: userProject(), options: { new: true, runValidators: true } }
    );

    await db.deleteOne(Verify, { value: token, type: "VERIFY_EMAIL", userId: user.id }, { error: null });
    res.body({ success: updatedUser }).ok();
    return;
  } catch (err) {
    handleError(err, res);
  }
};
