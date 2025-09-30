import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class VerifyService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.VerifyDelegate<ExtArgs, ClientOptions>, "verify"> {
  constructor(model: Prisma.VerifyDelegate<ExtArgs, ClientOptions>) {
    super(model, "verify");
  }
}

export const Verify = new VerifyService(prisma.verify);
