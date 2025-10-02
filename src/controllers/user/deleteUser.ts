import { CLIENT_URL } from "@/config";
import { Link } from "@/services/db/Link";
import { Money } from "@/services/db/Money";
import { Note } from "@/services/db/Note";
import { Schedule } from "@/services/db/Schedule";
import { Todo } from "@/services/db/Todo";
import { Transaction } from "@/services/db/Transaction";
import { TUser, User } from "@/services/db/User";
import { Verify } from "@/services/db/Verify";
import { AppError } from "@/services/error/AppError";
import { Response, Request, NextFunction } from "express";

const deletes = async (user: TUser) => {
  const deleteConfig = { where: { userId: user.id.toString() } };
  await Promise.allSettled([
    Note.deleteMany(deleteConfig),
    Link.deleteMany(deleteConfig),
    Schedule.deleteMany(deleteConfig),
    Todo.deleteMany(deleteConfig),
    Transaction.deleteMany(deleteConfig),
    Money.deleteMany(deleteConfig),
  ]);
  await User.deleteById(user.id.toString());
};

export const deleteUser = async (req: Request, { res }: Response, next: NextFunction) => {
  const resSuccess = () => res.deleteCookies(["accessToken", "refreshToken"]).redirect(`${CLIENT_URL}/signin`);
  try {
    const userId = req.user!.id.toString();
    const { token } = req.query;

    const user = await User.findById(userId);

    if (!user.verified && !user.googleId) {
      await deletes(user as TUser);
      resSuccess();
      return;
    }
    if (!token) {
      throw new AppError("CLIENT_FIELD", { field: "token", message: "Invalid token" });
    }

    await Verify.findFirst(
      { where: { value: token.toString(), type: "DELETE_ACCOUNT_OTP", userId: user.id.toString() } },
      { error: new AppError("INVALID_OTP") }
    );
    await deletes(user as TUser);
    resSuccess();
  } catch (err) {
    next(err);
  }
};
