import { User } from "@/services/db/User";
import { AppError } from "@/services/error/Error";
import { NextFunction, Request, Response } from "express";

export const updateUser = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { fullName } = req.body;
    if (!fullName) {
      res.tempMissingFields("full name").error();
      return;
    }
    if (fullName.trim() === user.fullName.toString().trim()) {
      throw new AppError("CLIENT_FIELD", { field: "newFullName", message: "New full name can not same as old full name" });
    }
    const updatedUser = await User.updateById(user.id.toString(), { data: { fullName } });
    res.info("Your profile successfully updated").body({ success: updatedUser }).ok();
  } catch (err) {
    next(err);
  }
};
