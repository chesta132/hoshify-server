import { NextFunction, Request, Response } from "express";
import { decrypt } from "@/utils/crypto";
import { sendRoleGranted } from "@/utils/email/send";
import { AppError } from "@/services/error/AppError";
import { normalizeUserQuery } from "@/utils/manipulate/normalize";
import { omitCreds, User } from "@/services/db/User";
import { UserRole } from "@prisma/client";
import { Verify } from "@/services/db/Verify";

export const acceptRequestRole = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const token = req.query.token?.toString();
    if (!token) {
      throw new AppError("MISSING_FIELDS", { fields: "token" });
    }

    const decrToken = decrypt(token.toString()) as string;
    const indexOfReqRole = decrToken.indexOf("requestRole_");
    const indexOfRole = decrToken.lastIndexOf("role_");

    const userId = decrToken.slice(indexOfReqRole + 12, indexOfRole - 1);
    const role = decrToken.slice(indexOfRole + 5) as UserRole;

    const verif = await Verify.findFirst({ where: { userId, value: token, type: "REQUEST_ROLE" } }, { error: new AppError("INVALID_VERIF_TOKEN") });

    const user = await User.updateById(userId, { data: { role }, omit: omitCreds() }, { error: new AppError("INVALID_VERIF_TOKEN") });

    await Verify.delete({ where: { id: verif.id } });
    await sendRoleGranted(role, user.email || user.gmail!, user.fullName);

    res.body({ success: normalizeUserQuery(user) }).respond();
  } catch (err) {
    next(err);
  }
};
