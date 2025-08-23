import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { decrypt } from "../../utils/crypto";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const verifyEmail = async (req: Request, { res }: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.tempMissingFields("token").respond();
      return;
    }

    const tokenDecrypted = decrypt(token);
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await User.findById(userId);
    if (!user) {
      res.tempInvalidVerifyToken().error();
      return;
    }
    if (user.verified) {
      res.tempIsVerified().respond();
      return;
    }

    const verification = await Verify.findOne({ value: token, type: "VERIFY_EMAIL", userId: user.id });
    if (!verification) {
      res.tempInvalidVerifyToken().error();
      return;
    }

    const updatedUser = await User.updateByIdAndNormalize(
      user.id,
      { verified: true },
      { project: userProject(), options: { new: true, runValidators: true } }
    );
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
