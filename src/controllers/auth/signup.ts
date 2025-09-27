import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { buildUserPopulate, IUser, User, UserPopulateField } from "../../models/User";
import { Money } from "@/models/Money";
import { validateRequires } from "@/utils/validate";
import { ServerError } from "@/class/ServerError";
import db from "@/services/crud";
import { initialPopulateConfig } from "../user/initiateUser";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { NormalizedData } from "@/types/types";

export const signup = async (req: Request, { res }: Response) => {
  try {
    const { email, password, fullName, rememberMe } = req.body;
    validateRequires(["email", "password", "fullName"], req.body);

    const potentialUser = await User.find({ $or: [{ email }, { gmail: email }] });
    potentialUser.forEach((potential) => {
      if (potential) {
        if (potential?.email === email) {
          throw new ServerError("CLIENT_FIELD", { field: "email", message: "Email is already in use" });
        } else {
          throw new ServerError("CLIENT_FIELD", {
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

    const newUser = (await db.getById(User, createdUser.id, { populate: buildUserPopulate(initialPopulateConfig) })) as NormalizedData<
      IUser & UserPopulateField
    >;
    (newUser.money as any) = normalizeCurrency(newUser.money, createdUser.currency);
    (newUser.transactions as any) = normalizeCurrency(newUser.transactions, createdUser.currency);

    res.body({ success: newUser }).sendCookie({ template: "REFRESH_ACCESS", rememberMe }).created();
  } catch (error) {
    handleError(error, res);
  }
};
