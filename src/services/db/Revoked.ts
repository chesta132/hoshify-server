import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { InferByDelegate } from "@/services/db/types";

export class RevokedService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.RevokedDelegate<ExtArgs, ClientOptions>,
  "revoked"
> {
  constructor(model: Prisma.RevokedDelegate<ExtArgs, ClientOptions>) {
    super(model, "revoked");
  }
}

export const Revoked = new RevokedService(prisma.revoked);
export type ModelRevoked = typeof Revoked;
export type TRevoked = InferByDelegate<typeof prisma.revoked>;
