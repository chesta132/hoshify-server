import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { InternalArgs } from "@prisma/client/runtime/library";

export class LinkService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.LinkDelegate<ExtArgs, ClientOptions>, "link"> {
  constructor(model: Prisma.LinkDelegate<ExtArgs, ClientOptions>) {
    super(model, "link");
  }
}

export const Link = new LinkService(prisma.link);
export type ModelLink = typeof Link;
