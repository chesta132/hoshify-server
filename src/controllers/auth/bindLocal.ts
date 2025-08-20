import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import bcrypt from "bcrypt";
import { resIsBinded, resMissingFields } from "../../utils/response";
import { User } from "../../models/User";
import { Res } from "../../class/Response";

export const bindLocal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    if (!email || !password) {
      resMissingFields(res, "Email, password");
      return;
    }
    if (user.email) {
      resIsBinded(res);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.updateByIdAndSanitize(
      user.id,
      {
        email,
        password: hashedPassword,
      },
      { project: userProject() }
    );
    const respond = Res(res, updatedUser, { notif: "Successfully link to local account" });
    respond.response();
  } catch (err) {
    handleError(err, res);
  }
};
