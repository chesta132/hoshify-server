import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { User, userRole } from "@/models/User";
import { Verify } from "@/models/Verify";
import { encrypt } from "@/utils/crypto";
import { sendRequestRole } from "@/utils/email";
import { oneMin } from "@/utils/token";
import { userProject } from "@/utils/normalizeQuery";

export const requestRole = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { role } = req.body;
    if (!userRole.includes(role) || user.role === role) {
      res.tempClientType("role").respond();
    }

    const token = encrypt(`requestRole_${user.id}_role_${role}`);

    await Verify.create({
      userId: user.id,
      value: token,
      type: "REQUEST_ROLE",
      deleteAt: new Date(Date.now() + oneMin * 30),
    });

    await sendRequestRole(role, token, user.fullName);
    const updatedUser = await User.updateByIdAndNormalize(
      user.id,
      { timeToAllowSendEmail: new Date(Date.now() + oneMin * 2) },
      { project: userProject() }
    );

    res.body({ success: updatedUser }).respond();
  } catch (err) {
    handleError(err, res);
  }
};
