import { Link } from "@/services/db/Link";
import { NextFunction, Request, Response } from "express";

export const deleteLink = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deletedLink = await Link.deleteById(id);
    res.body({ success: deletedLink }).info(`${deletedLink.title} deleted`).respond();
  } catch (err) {
    next(err);
  }
};

export const deleteLinks = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const ids: any[] = req.body;

    await Link.deleteMany({ where: { id: { in: ids } } });

    res.noContent();
  } catch (err) {
    next(err);
  }
};
