import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { ErrorRes, Res } from "../../class/Response";
import { resIsVerified, resMissingFields, resNotFound } from "../../utils/response";
import { decrypt } from "../../utils/crypto";
import { User } from "../../models/User";
import { Verify } from "../../models/Verify";

export const verifyEmail = async (req: Request, res: Response) => {
  const resInvalidToken = () =>
    ErrorRes({
      message: "Invalid or expired Verification otp. Please create a new verification email request.",
      code: "CLIENT_FIELD",
      field: "otp",
    });

  try {
    const { otp } = req.body;
    if (!otp) {
      resMissingFields(res, "OTP");
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
      resIsVerified(res);
      return;
    }

    const verification = await Verify.findOne({ value: otp, type: "VERIFY_EMAIL", userId: user.id });
    if (!verification) {
      resInvalidToken();
      return;
    }

    const updatedUser = await User.updateByIdAndSanitize(user.id, { verified: true }, { project: userProject() });
    if (!updatedUser) {
      resNotFound(res, "user");
      return;
    }
    await Verify.deleteMany({ value: otp, type: "VERIFY_EMAIL", userId: user.id });
    Res(res, updatedUser).response();
    return;
  } catch (err) {
    handleError(err, res);
  }
};
