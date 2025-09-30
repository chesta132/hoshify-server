import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Service";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class MoneyService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.MoneyDelegate<ExtArgs, ClientOptions>, "money"> {
  constructor(model: Prisma.MoneyDelegate<ExtArgs, ClientOptions>) {
    super(model, "money");
  }
}

export const Money = new MoneyService(prisma.money);
