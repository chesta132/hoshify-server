import { NextFunction, Request, Response } from "express";
import { decrypt } from "../../utils/crypto";
import { AppError } from "@/services/error/AppError";
import { omitCreds, User } from "@/services/db/User";
import { Verify } from "@/services/db/Verify";

export const verifyEmail = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const token = req.query.token?.toString();
    if (!token) {
      throw new AppError("MISSING_FIELDS", { fields: "token" });
    }

    const tokenDecrypted = decrypt(token?.toString());
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await User.findById(userId, {}, { error: new AppError("INVALID_VERIF_TOKEN") });
    if (user.verified) {
      throw new AppError("IS_VERIFIED", {});
    }

    const verif = await Verify.findFirst(
      { where: { value: token, type: "VERIFY_EMAIL", userId: user.id } },
      { error: new AppError("INVALID_VERIF_TOKEN") }
    );

    const updatedUser = await User.updateById(user.id, { data: { verified: true }, omit: omitCreds() });

    await Verify.delete({ where: { id: verif.id } }, { error: null });
    res.body({ success: updatedUser }).ok();
    return;
  } catch (err) {
    next(err);
  }
};
