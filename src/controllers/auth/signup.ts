import { Response, Request, NextFunction } from "express";
import bcrypt from "bcrypt";
import { validateRequires } from "@/utils/validate";
import { AppError } from "@/services/error/AppError";
import { User } from "@/services/db/User";
import { Money } from "@/services/db/Money";

export const signup = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, rememberMe } = req.body;
    validateRequires(["email", "password", "fullName"], req.body);

    const potentialUser = await User.findMany({ where: { OR: [{ email }, { gmail: email }] } });
    potentialUser.forEach((potential) => {
      if (potential) {
        if (potential?.email === email) {
          throw new AppError("CLIENT_FIELD", { field: "email", message: "Email is already in use" });
        } else {
          throw new AppError("CLIENT_FIELD", {
            field: "email",
            message: "Email is already bind with google account, please bind on account settings",
          });
        }
      }
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });
    await Money.create({ data: { userId: createdUser.id } });

    const newUser = await User.findById(createdUser.id);

    res.body({ success: newUser }).sendCookie({ template: "REFRESH_ACCESS", rememberMe }).created();
  } catch (error) {
    next(error);
  }
};
