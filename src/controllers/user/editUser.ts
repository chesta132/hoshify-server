import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { User } from "../../models/User";
import { resMissingFields, resNotFound } from "../../utils/response";
import { ErrorRes, Res } from "../../class/Response";

export const editUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { fullName } = req.body;
    if (!fullName) {
      resMissingFields(res, "full name");
      return;
    }
    if (fullName.trim() === user.fullName.trim()) {
      ErrorRes({ code: "CLIENT_FIELD", message: "New full name can not same as old full name", field: "newFullName" }).response(res);
      return;
    }
    const updatedUser = await User.updateByIdAndSanitize(
      user.id,
      { fullName },
      { options: { new: true, runValidators: true }, project: userProject() }
    );
    if (!updatedUser) {
      resNotFound(res, "user");
      return;
    }
    Res(res, updatedUser, { notif: "Your profile successfully updated" }).response();
  } catch (err) {
    handleError(err, res);
  }
};
