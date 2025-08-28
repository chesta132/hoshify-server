import { Request, Response } from "express";
import handleError from "@/utils/handleError";
import { Link } from "@/models/Link";
import { ellipsis } from "@/utils/manipulate";

export const createLink = async (req: Request, { res }: Response) => {
  try {
    const user = req.user!;
    let { title, link } = req.body;
    if (!title || !link) {
      res.tempMissingFields("title, details").respond();
      return;
    }
    const lastLink = await Link.findOne({ userId: user.id }).sort({ position: -1 }).normalize();
    const position = (lastLink?.position || 0) + 1;

    const createdLink = await Link.create({
      title,
      link,
      userId: user.id,
      position,
    });
    res
      .body({ success: createdLink })
      .notif(`${ellipsis(createdLink.title, 30)} added`)
      .created();
  } catch (err) {
    handleError(err, res);
  }
};
