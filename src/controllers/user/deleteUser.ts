import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { CLIENT_URL } from "../../app";
import { IUser, User } from "../../models/User";
import { Verify } from "../../models/Verify";
import { Note } from "../../models/Note";
import { Link } from "../../models/Link";
import { Schedule } from "../../models/Schedule";
import { Todo } from "../../models/Todo";
import { Transaction } from "../../models/Transaction";
import { Money } from "@/models/Money";
import { NormalizedData } from "@/types/types";

const deletes = async (user: NormalizedData<IUser>) => {
  const deleteConfig = { userId: user.id } as const;
  await Promise.allSettled([
    Note.deleteMany(deleteConfig),
    Link.deleteMany(deleteConfig),
    Schedule.deleteMany(deleteConfig),
    Todo.deleteMany(deleteConfig),
    Transaction.deleteMany(deleteConfig),
    Money.deleteMany(deleteConfig),
  ]);
  await User.findByIdAndDelete(user.id);
};

export const deleteUser = async (req: Request, { res }: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.query;

    const user = await User.findById(userId).normalize();
    if (!user) {
      res.tempNotFound("user").respond();
      return;
    }

    if (!user.verified && !user.googleId) {
      await deletes(user);
      res.clearCookie("accessToken").clearCookie("refreshToken").redirect(`${CLIENT_URL}/signin`);
      return;
    }
    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const otp = await Verify.findOne({ value: token, type: "DELETE_ACCOUNT_OTP", userId: user.id }).normalize();
    if (!otp) {
      res.tempInvalidOTP().respond();
      return;
    }
    await deletes(user);
    res.clearCookie("accessToken").clearCookie("refreshToken").redirect(`${CLIENT_URL}/signin`);
  } catch (err) {
    handleError(err, res);
  }
};
