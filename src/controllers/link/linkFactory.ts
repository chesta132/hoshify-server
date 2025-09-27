import { createManyFactory } from "../factory/createMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";
import { getManyFactory } from "../factory/getMany";
import { Link } from "@/models/Link";
import { updateManyFactory } from "../factory/updateMany";

export const getLinks = getManyFactory(Link, { settings: { sort: { position: 1 } } });

export const createLinks = createManyFactory(
  Link,
  { neededField: ["title", "link"], acceptableField: ["position"] },
  {
    async funcInitiator(req) {
      const lastLink = await Link.findOne({ userId: req.user?.id }).sort({ position: -1 }).normalize();
      let position = (lastLink?.position || 0) + 1;
      (req.body as any[]).forEach((data) => {
        data.position = position++;
      });
    },
  }
);

export const createLink = createOneFactory(
  Link,
  { neededField: ["title", "link"], acceptableField: ["position"] },
  {
    async funcInitiator(req) {
      const lastLink = await Link.findOne({ userId: req.user!.id }).sort({ position: -1 }).normalize();
      const position = (lastLink?.position || 0) + 1;
      req.body.position = position;
    },
  }
);

export const updateLink = updateOneFactory(Link, { neededField: ["title", "link"], acceptableField: ["position"] });

export const updateLinks = updateManyFactory(Link, { neededField: ["title", "link"], acceptableField: ["position"] })