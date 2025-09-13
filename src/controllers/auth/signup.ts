import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { buildUserPopulate, User } from "../../models/User";
import { Money } from "@/models/Money";
import { validateRequires } from "@/utils/validate";
import { ErrorTemplate } from "@/class/ErrorTemplate";
import db from "@/services/crud";
import { initialPopulateConfig } from "../user/initiateUser";

export const signup = async (req: Request, { res }: Response) => {
  try {
    const { email, password, fullName, rememberMe } = req.body;
    validateRequires(["email", "password", "fullName"], req.body);

    const potentialUser = await User.find({ $or: [{ email }, { gmail: email }] });
    potentialUser.forEach((potential) => {
      if (potential) {
        if (potential?.email === email) {
          throw new ErrorTemplate("CLIENT_FIELD", { field: "email", message: "Email is already in use" });
        } else {
          throw new ErrorTemplate("CLIENT_FIELD", {
            field: "email",
            message: "Email is already bind with google account, please bind on account settings",
          });
        }
      }
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await db.create(User, {
      email,
      password: hashedPassword,
      fullName,
    });
    await db.create(Money, { userId: createdUser.id });

    const newUser = await db.getById(User, createdUser.id, { populate: buildUserPopulate(initialPopulateConfig) });

    res.body({ success: newUser }).sendCookie({ template: "REFRESH_ACCESS", rememberMe }).created();
  } catch (error) {
    handleError(error, res);
  }
};
