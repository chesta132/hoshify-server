import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/manipulate/normalize";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { validateRequires } from "@/utils/validate";

export const bindLocal = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    if (!validateRequires(["email", "password"], req.body, res)) return;
    if (user.email) {
      res.tempIsBound().error();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        email,
        password: hashedPassword,
      },
      { projection: userProject() }
    ).normalize();
    res.info("Successfully link to local account").body({ success: updatedUser }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
