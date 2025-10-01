import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { InternalArgs } from "@prisma/client/runtime/library";
import { InferByDelegate } from "@/types/db";

export class MoneyService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.MoneyDelegate<ExtArgs, ClientOptions>, "money"> {
  constructor(model: Prisma.MoneyDelegate<ExtArgs, ClientOptions>) {
    super(model, "money");
  }
}

export const Money = new MoneyService(prisma.money);
export type ModelMoney = typeof Money;
export type TMoney = InferByDelegate<typeof prisma.money>;
