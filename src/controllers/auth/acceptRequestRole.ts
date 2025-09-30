import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Verify } from "@/models/Verify";
import { decrypt } from "@/utils/crypto";
import { User, UserRole } from "@/models/User";
import { normalizeUserQuery, userProject } from "@/utils/manipulate/normalize";
import { sendRoleGranted } from "@/utils/email/send";
import { ServerError } from "@/class/Error";
import { getOne } from "@/services/crud/read";
import { updateById } from "@/services/crud/update";
import { deleteOne } from "@/services/crud/delete";

export const acceptRequestRole = async (req: Request, { res }: Response) => {
  try {
    const token = req.query.token?.toString();
    if (!token) {
      throw new ServerError({ code: "MISSING_FIELDS", fields: "token" });
    }

    const decrToken = decrypt(token.toString()) as string;
    const indexOfReqRole = decrToken.indexOf("requestRole_");
    const indexOfRole = decrToken.lastIndexOf("role_");

    const userId = decrToken.slice(indexOfReqRole + 12, indexOfRole - 1);
    const role = decrToken.slice(indexOfRole + 5) as UserRole;

    await getOne(Verify, { userId, value: token, type: "REQUEST_ROLE" }, { error: { code: "INVALID_VERIF_TOKEN" } });

    const user = await updateById(
      User,
      userId,
      { role },
      { options: { new: true, runValidators: true, projection: userProject() }, error: { code: "INVALID_VERIF_TOKEN" } }
    );

    await deleteOne(Verify, { value: token, type: "REQUEST_ROLE", userId });
    await sendRoleGranted(role, user.email || user.gmail!, user.fullName);

    res.body({ success: normalizeUserQuery(user) }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
