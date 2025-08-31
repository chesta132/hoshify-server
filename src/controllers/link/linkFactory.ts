import { createManyFactory } from "../factory/createMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";
import { getManyFactory } from "../factory/getMany";
import { Link } from "@/models/Link";

export const getLinks = getManyFactory(Link);

export const createLinks = createManyFactory(Link, ["title", "link"], {
  async funcInitiator(req) {
    const lastLink = await Link.findOne({ userId: req.user?.id }).sort({ position: -1 }).normalize();
    let position = lastLink?.position || 0;
    (req.body as any[]).forEach((data) => {
      data.position = position++;
    });
  },
});

export const createLink = createOneFactory(Link, ["title", "link"], {
  async funcInitiator(req) {
    const lastLink = await Link.findOne({ userId: req.user!.id }).sort({ position: -1 }).normalize();
    const position = (lastLink?.position || 0) + 1;
    req.body.position = position;
  },
});

export const updateLink = updateOneFactory(Link);
