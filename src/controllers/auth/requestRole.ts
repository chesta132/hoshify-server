import { NextFunction, Request, Response } from "express";
import { encrypt } from "@/utils/crypto";
import { sendRequestRole } from "@/utils/email/send";
import { AppError } from "@/services/error/Error";
import { UserRole } from "@prisma/client";
import { omitCreds, User, userRole } from "@/services/db/User";
import { Verify } from "@/services/db/Verify";
import { timeInMs } from "@/utils/manipulate/number";

export const requestRole = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    let { role }: { role?: UserRole } = req.query;
    role = role?.toString().toUpperCase() as UserRole;
    if (!userRole.includes(role) || user.role === role) {
      throw new AppError("CLIENT_TYPE", { fields: "role" });
    }

    const token = encrypt(`requestRole_${user.id}_role_${role}`);

    await Verify.create({
      data: {
        userId: user.id.toString(),
        value: token,
        type: "REQUEST_ROLE",
        deleteAt: new Date(Date.now() + timeInMs({ minute: 30 })),
      },
    });

    await sendRequestRole(role, token, user.fullName.toString());
    const updatedUser = await User.updateById(user.id.toString(), {
      data: { timeToAllowSendEmail: new Date(Date.now() + timeInMs({ minute: 2 })) },
      omit: omitCreds(),
    });

    res.body({ success: updatedUser }).respond();
  } catch (err) {
    next(err);
  }
};
