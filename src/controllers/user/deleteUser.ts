import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { CLIENT_URL } from "../../app";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";
import { Note } from "../../models/Note";
import { Link } from "../../models/Link";
import { Schedule } from "../../models/Schedule";
import { Todo } from "../../models/Todo";
import { Widget } from "../../models/Widget";
import { Transaction } from "../../models/Transaction";

export const deleteUser = async (req: Request, { res }: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.query;

    const user = await User.findByIdAndNormalize(userId);
    if (!user) {
      res.tempNotFound("user").respond();
      return;
    }

    const deletes = async () => {
      const deleteConfig = { userId: user.id } as const;
      await Promise.allSettled([
        Note.deleteMany(deleteConfig),
        Link.deleteMany(deleteConfig),
        Schedule.deleteMany(deleteConfig),
        Todo.deleteMany(deleteConfig),
        Widget.deleteMany(deleteConfig),
        Transaction.deleteMany(deleteConfig),
      ]);
      await User.findByIdAndDelete(user.id);
    };

    if (!user.verified && !user.googleId) {
      await deletes();
      res.clearCookie("accessToken").clearCookie("refreshToken").redirect(`${CLIENT_URL}/signin`);
    }
    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const otp = await Verify.findOne({ value: token, type: "DELETE_ACCOUNT_OTP", userId: user.id });
    if (!otp && user.verified) {
      res.tempInvalidOTP().respond();
      return;
    }
    await deletes();
    res.clearCookie("accessToken").clearCookie("refreshToken").redirect(`${CLIENT_URL}/signin`);
  } catch (err) {
    handleError(err, res);
  }
};
