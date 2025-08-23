import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { CLIENT_URL } from "../../app";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";
import { Note } from "../../models/Note";
import { QuickLink } from "../../models/QuickLink";
import { Schedule } from "../../models/Schedule";
import { Todo } from "../../models/Todo";
import { Widget } from "../../models/Widget";
import { Transaction } from "../../models/Transaction";

export const deleteUser = async (req: Request, { res }: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    const userIncludes = ["links", "money", "notes", "schedules", "todos", "widgets"];

    const user = await User.findByIdAndNormalize(userId, { populate: userIncludes });
    if (!user) {
      res.tempNotFound("user").respond();
      return;
    }
    if (token) {
      const otp = await Verify.findOne({ value: token, type: "DELETE_ACCOUNT_OTP", userId: user.id });
      if (!otp && user.verified) {
        res.tempInvalidOTP().respond();
        return;
      }
    }

    const deleteConfig = { userId: user.id } as const;
    await Promise.allSettled([
      Note.deleteMany(deleteConfig),
      QuickLink.deleteMany(deleteConfig),
      Schedule.deleteMany(deleteConfig),
      Todo.deleteMany(deleteConfig),
      Widget.deleteMany(deleteConfig),
      Transaction.deleteMany(deleteConfig),
    ]);
    await User.findByIdAndDelete(user.id);
    res.clearCookie("accessToken").clearCookie("refreshToken");

    res.redirect(`${CLIENT_URL}/signin`);
  } catch (err) {
    handleError(err, res);
  }
};
