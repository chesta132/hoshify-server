import { createMany } from "../templates/createMany";
import { getMany } from "../templates/getMany";
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
