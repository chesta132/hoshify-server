import { Link } from "@/services/db/Link";
import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";

export const getLinks = getManyFactory(Link, { query: { orderBy: { position: "asc" } } });

export const createLinks = createManyFactory(
  Link,
  { neededField: ["title", "link"], acceptableField: ["position"] },
  {
    async funcInitiator(req) {
      const lastLink = await Link.findFirst({ where: { userId: req.user?.id.toString() }, orderBy: { position: "desc" } }, { error: null });
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
      const lastLink = await Link.findFirst({ where: { userId: req.user!.id.toString() }, orderBy: { position: "desc" } }, { error: null });
      const position = (lastLink?.position || 0) + 1;
      req.body.position = position;
    },
  }
);

export const updateLink = updateOneFactory(Link, { neededField: ["title", "link"], acceptableField: ["position"] });

export const updateLinks = updateManyFactory(Link, { neededField: ["title", "link"], acceptableField: ["position"] });
