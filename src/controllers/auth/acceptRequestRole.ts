import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Verify } from "@/models/Verify";
import { decrypt } from "@/utils/crypto";
import { User, UserRole } from "@/models/User";
import { normalizeUserQuery, userProject } from "@/utils/manipulate/normalize";
import { sendRoleGranted } from "@/utils/email/send";

export const acceptRequestRole = async (req: Request, { res }: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const decrToken = decrypt(token.toString()) as string;
    const indexOfReqRole = decrToken.indexOf("requestRole_");
    const indexOfRole = decrToken.lastIndexOf("role_");

    const userId = decrToken.slice(indexOfReqRole + 12, indexOfRole - 1);
    const role = decrToken.slice(indexOfRole + 5) as UserRole;

    const verification = await Verify.findOne({
      userId,
      value: token,
      type: "REQUEST_ROLE",
    }).normalize();
    if (!verification) {
      res.tempInvalidVerifyToken().error();
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true, projection: userProject() }).normalize();
    if (!user) {
      res.tempInvalidVerifyToken().error();
      return;
    }

    await Verify.deleteOne({ value: token, type: "REQUEST_ROLE", userId });
    await sendRoleGranted(role, user.email || user.gmail!, user.fullName);

    res.body({ success: normalizeUserQuery(user) }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
