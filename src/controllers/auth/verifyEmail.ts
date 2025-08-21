import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { decrypt } from "../../utils/crypto";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const verifyEmail = async (req: Request, { res }: Response) => {
  const resInvalidToken = () =>
    res
      .tempClientField({
        message: "Invalid or expired Verification otp. Please create a new verification email request.",
        field: "otp",
      })
      .error();

  try {
    const { otp } = req.body;
    if (!otp) {
      res.tempMissingFields("OTP").respond();
      return;
    }

    const tokenDecrypted = decrypt(otp);
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await User.findById(userId);
    if (!user) {
      resInvalidToken();
      return;
    }
    if (user.verified) {
      res.tempIsVerified().respond();
      return;
    }

    const verification = await Verify.findOne({ value: otp, type: "VERIFY_EMAIL", userId: user.id });
    if (!verification) {
      resInvalidToken();
      return;
    }

    const updatedUser = await User.updateByIdAndSanitize(user.id, { verified: true }, { project: userProject() });
    if (!updatedUser) {
      res.tempNotFound("user");
      return;
    }
    await Verify.deleteMany({ value: otp, type: "VERIFY_EMAIL", userId: user.id });
    res.body({ success: updatedUser }).ok();
    return;
  } catch (err) {
    handleError(err, res);
  }
};
