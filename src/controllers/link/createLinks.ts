import { createMany } from "../templates/createMany";
import { Link } from "@/models/Link";
import { Request, Response } from "express";

export const createLinks = async (req: Request, res: Response) => {
  const lastLink = await Link.findOne({ userId: req.user?.id }).sort({ position: -1 }).normalize();
  let position = lastLink?.position || 0;
  await createMany(
    Link,
    ["title", "link"],
    () => {},
    (data) => {
      data.position = position++;
    }
  )(req, res);
};
