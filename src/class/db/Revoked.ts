import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class RevokedService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.RevokedDelegate<ExtArgs, ClientOptions>,
  "revoked"
> {
  constructor(model: Prisma.RevokedDelegate<ExtArgs, ClientOptions>) {
    super(model, "revoked");
  }
}

export const Revoked = new RevokedService(prisma.revoked);
