import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { InferByDelegate } from "@/services/db/types";

export class VerifyService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.VerifyDelegate<ExtArgs, ClientOptions>, "verify"> {
  constructor(model: Prisma.VerifyDelegate<ExtArgs, ClientOptions>) {
    super(model, "verify");
  }
}

export const Verify = new VerifyService(prisma.verify);
export type ModelVerify = typeof Verify;
export type TVerify = InferByDelegate<typeof prisma.verify>;
