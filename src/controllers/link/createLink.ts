import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Link } from "@/models/Link";

export const createLink = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    let { title, link } = req.body;
    if (!title || !link) {
      res.tempMissingFields("title, details").respond();
      return;
    }
    const lastLink = await Link.findOne({ userId: user.id }).sort({ position: -1 });
    const position = (lastLink?.position || 0) + 1;

    const createdLink = await Link.create({
      title,
      link,
      userId: user.id,
      position,
    });
    res
      .body({ success: createdLink })
      .notif(`${createdLink.title.ellipsis(30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
