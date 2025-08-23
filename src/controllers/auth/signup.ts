import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import bcrypt from "bcrypt";
import { normalizeUserQuery } from "../../utils/normalizeQuery";
import { User } from "../../models/User";

export const signup = async (req: Request, { res }: Response) => {
  try {
    const { username, email, password, fullName, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) {
      res.tempMissingFields("username, email, password, and full name").respond();
      return;
    }

    const potentialUser = await User.find({ $or: [{ email }, { gmail: email }] });
    potentialUser.forEach((potential) => {
      if (potential) {
        if (potential?.email === email) {
          return res.tempClientField("email", "Email is already in use").error();
        } else return res.tempClientField("email", "Email is already bind with google account, please bind on account settings").error();
      }
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawNewUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
    });
    const newUser = normalizeUserQuery(rawNewUser);

    res.body({ success: newUser }).sendCookie({ template: "REFRESH_ACCESS", rememberMe }).created();
  } catch (error) {
    handleError(error, res);
  }
};
