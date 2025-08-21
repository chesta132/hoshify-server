import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { userProject } from "../../utils/normalizeQuery";
import { User } from "../../models/User";

export const editUser = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    const { fullName } = req.body;
    if (!fullName) {
      res.tempMissingFields("full name").error();
      return;
    }
    if (fullName.trim() === user.fullName.trim()) {
      res.tempClientField({ message: "New full name can not same as old full name", field: "newFullName" }).error();
      return;
    }
    const updatedUser = await User.updateByIdAndSanitize(
      user.id,
      { fullName },
      { options: { new: true, runValidators: true }, project: userProject() }
    );
    if (!updatedUser) {
      res.tempNotFound("user").respond();
      return;
    }
    res.notif("Your profile successfully updated").body({ success: updatedUser }).ok();
  } catch (err) {
    handleError(err, res);
  }
};
