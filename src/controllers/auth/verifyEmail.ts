import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/manipulate/normalize";
import { decrypt } from "../../utils/crypto";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const verifyEmail = async (req: Request, { res }: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const tokenDecrypted = decrypt(token?.toString());
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await User.findById(userId).normalize();
    if (!user) {
      res.tempInvalidVerifyToken().error();
      return;
    }
    if (user.verified) {
      res.tempIsVerified().respond();
      return;
    }

    const verification = await Verify.findOne({ value: token, type: "VERIFY_EMAIL", userId: user.id }).normalize();
    if (!verification) {
      res.tempInvalidVerifyToken().error();
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { verified: true },
      { projection: userProject(), new: true, runValidators: true }
    ).normalize();
    if (!updatedUser) {
      res.tempNotFound("user");
      return;
    }
    await Verify.deleteOne({ value: token, type: "VERIFY_EMAIL", userId: user.id });
    res.body({ success: updatedUser }).ok();
    return;
  } catch (err) {
    handleError(err, res);
  }
};
