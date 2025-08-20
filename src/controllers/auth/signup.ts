import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { resMissingFields } from "../../utils/response";
import { ErrorRes, Res } from "../../class/Response";
import { User } from "../../models/User";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) {
      resMissingFields(res, "username, email, password, and full name");
      return;
    }

    const potentialUser = await User.find({ $or: [{ email }, { gmail: email }] });
    potentialUser.forEach((potential) => {
      if (potential) {
        if (potential?.email === email) {
          return ErrorRes({ code: "CLIENT_FIELD", message: "Email is already in use", field: "email" }).response(res);
        } else
          return ErrorRes({
            code: "CLIENT_FIELD",
            message: "Email is already bind with google account, please bind on account settings",
            field: "email",
          }).response(res);
      }
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawNewUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
    });
    const newUser = normalizeUserQuery(rawNewUser);

    Res(res, newUser, { cookie: { template: "REFRESH_ACCESS", rememberMe } })
      .sendCookie()
      .created();
  } catch (error) {
    handleError(error, res);
  }
};
