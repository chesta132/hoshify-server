import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import bcrypt from "bcrypt";
import { User } from "../../models/User";

export const bindLocal = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    if (!email || !password) {
      res.tempMissingFields("email, password").error();
      return;
    }
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
    );
    res.notif("Successfully link to local account").body({ success: updatedUser }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
