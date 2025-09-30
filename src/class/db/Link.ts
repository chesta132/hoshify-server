import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Service";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class LinkService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.LinkDelegate<ExtArgs, ClientOptions>, "link"> {
  constructor(model: Prisma.LinkDelegate<ExtArgs, ClientOptions>) {
    super(model, "link");
  }
}

export const Link = new LinkService(prisma.link);
