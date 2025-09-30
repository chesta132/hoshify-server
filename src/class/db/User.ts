import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class UserService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.UserDelegate<ExtArgs, ClientOptions>, "user"> {
  constructor(model: Prisma.UserDelegate<ExtArgs, ClientOptions>) {
    super(model, "user");
  }
}

export const User = new UserService(prisma.user);
export type ModelUser = typeof User;
