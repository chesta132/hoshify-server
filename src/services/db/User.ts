import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { InternalArgs } from "@prisma/client/runtime/library";

export class UserService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.UserDelegate<ExtArgs, ClientOptions>, "user"> {
  constructor(model: Prisma.UserDelegate<ExtArgs, ClientOptions>) {
    super(model, "user");
  }
}

export const User = new UserService(prisma.user);
export type ModelUser = typeof User;
