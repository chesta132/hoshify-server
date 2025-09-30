import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/manipulate/normalize";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { validateRequires } from "@/utils/validate";
import { updateById } from "@/services/crud/update";
import { AppError } from "@/class/Error";

export const bindLocal = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    validateRequires(["email", "password"], req.body);
    if (user.email) {
      throw new AppError("IS_BOUND");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await updateById(User, user.id, { email, password: hashedPassword }, { project: userProject() });
    res.info("Successfully link to local account").body({ success: updatedUser }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
