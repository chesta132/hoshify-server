import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/services/error/AppError";
import { omitCreds, User } from "@/services/db/User";

export const bindLocal = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    validateRequires(["email", "password"], req.body);
    if (user.email) {
      throw new AppError("IS_BOUND");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.updateById(user.id.toString(), { data: { email, password: hashedPassword }, omit: omitCreds() });
    res.info("Successfully link to local account").body({ success: updatedUser }).ok();
  } catch (err) {
    next(err);
  }
};
