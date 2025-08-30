import { createMany } from "../factory/createMany";
import { createOne } from "../factory/createOne";
import { getMany } from "../factory/getMany";
import { Link } from "@/models/Link";

export const getLinks = getMany(Link);

export const createLinks = createMany(Link, ["title", "link"], {
  async funcInitiator(req) {
    const lastLink = await Link.findOne({ userId: req.user?.id }).sort({ position: -1 }).normalize();
    let position = lastLink?.position || 0;
    (req.body as any[]).forEach((data) => {
      data.position = position++;
    });
  },
});

export const createLink = createOne(Link, ["title", "link"], {
  async funcInitiator(req) {
    const lastLink = await Link.findOne({ userId: req.user!.id }).sort({ position: -1 }).normalize();
    const position = (lastLink?.position || 0) + 1;
    req.body.position = position;
  },
});
